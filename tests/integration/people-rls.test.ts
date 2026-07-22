import { randomUUID } from 'node:crypto'
import { Client } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Prueba de integración real de RLS contra Postgres (docs/03-modelo-datos.md §3.10).
 * Requiere una base de datos con el esquema aplicado — ejecuta primero:
 *   ./scripts/setup-test-db.sh
 * y exporta TEST_DATABASE_URL (el script imprime el valor por defecto al terminar).
 * Si la variable no está definida, esta suite se omite en vez de fallar, para no romper
 * `npm test` en entornos sin la base de datos de pruebas configurada.
 */
const connectionString = process.env.TEST_DATABASE_URL

describe.skipIf(!connectionString)('RLS de people/salary_records (integración)', () => {
  let client: Client
  // Conexión superusuario, solo para preparar fixtures que hoy no tienen un flujo propio en
  // la app (invitar a un manager existente es Fase 4, docs/06-roadmap.md) — nunca se usa
  // para las aserciones, que siempre pasan por `client` (rol `authenticated`, con RLS).
  let adminClient: Client

  async function asUser<T>(userId: string, fn: () => Promise<T>): Promise<T> {
    // SET no admite parámetros bind; set_config() sí, y es equivalente.
    await client.query("select set_config('app.current_user_id', $1, false)", [userId])
    return fn()
  }

  /** Cada test necesita usuarios nuevos: bootstrap_organization() solo admite una organización por usuario. */
  async function createUser(label: string): Promise<string> {
    const id = randomUUID()
    await client.query('insert into auth.users (id, email) values ($1, $2)', [id, `${label}-${id}@test.local`])
    return id
  }

  beforeAll(async () => {
    client = new Client({ connectionString })
    await client.connect()

    const adminUrl = new URL(connectionString!)
    adminUrl.username = 'postgres'
    adminUrl.password = 'postgres'
    adminClient = new Client({ connectionString: adminUrl.toString() })
    await adminClient.connect()
  })

  afterAll(async () => {
    await client.end()
    await adminClient.end()
  })

  it('un usuario puede leer su propia fila de memberships sin recursión (regresión)', async () => {
    // Bug real de producción: memberships_select consultaba memberships dentro de su propia
    // política, provocando "infinite recursion" en cada carga de página autenticada
    // (requireCurrentSession hace exactamente esta consulta) y un bucle /hoy ⇄ /login.
    const adminUserId = await createUser('admin-membership-check')
    const orgId = await asUser(adminUserId, async () => {
      const { rows } = await client.query('select bootstrap_organization($1) as id', ['Org Membership Check'])
      return rows[0].id
    })

    const ownRow = await asUser(adminUserId, async () => {
      const { rows } = await client.query('select role, organization_id from memberships where user_id = $1', [
        adminUserId,
      ])
      return rows
    })
    expect(ownRow).toHaveLength(1)
    expect(ownRow[0].organization_id).toBe(orgId)

    const otherUserId = await createUser('unrelated-membership-check')
    const otherVisible = await asUser(otherUserId, async () => {
      const { rows } = await client.query('select id from memberships where user_id = $1', [adminUserId])
      return rows
    })
    expect(otherVisible).toHaveLength(0)
  })

  it('aísla los datos de dos organizaciones distintas', async () => {
    const adminAUserId = await createUser('admin-a')
    const adminBUserId = await createUser('admin-b')

    const orgAId = await asUser(adminAUserId, async () => {
      const { rows } = await client.query<{ bootstrap_organization: string }>(
        'select bootstrap_organization($1)',
        ['Org A'],
      )
      return rows[0].bootstrap_organization
    })

    await asUser(adminBUserId, async () => {
      await client.query('select bootstrap_organization($1)', ['Org B'])
    })

    const laura = await asUser(adminAUserId, async () => {
      const { rows } = await client.query(
        `select * from create_person_with_initial_salary($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [orgAId, 'Laura', 'Martín', 'laura@test.local', null, 'Growth Lead', null, null, '2023-01-01', 'indefinido', 31000, 'EUR'],
      )
      return rows[0]
    })

    expect(laura.first_name).toBe('Laura')

    const salary = await asUser(adminAUserId, async () => {
      const { rows } = await client.query('select gross_annual_salary from salary_records where person_id = $1', [
        laura.id,
      ])
      return rows
    })
    expect(salary).toHaveLength(1)
    expect(Number(salary[0].gross_annual_salary)).toBe(31000)

    const visibleToAdminB = await asUser(adminBUserId, async () => {
      const { rows } = await client.query('select id from people where id = $1', [laura.id])
      return rows
    })
    expect(visibleToAdminB).toHaveLength(0)

    const salaryVisibleToAdminB = await asUser(adminBUserId, async () => {
      const { rows } = await client.query('select id from salary_records where person_id = $1', [laura.id])
      return rows
    })
    expect(salaryVisibleToAdminB).toHaveLength(0)
  })

  it('impide actualizar o borrar salary_records (append-only)', async () => {
    const adminAUserId = await createUser('admin-append-only')
    const orgId = await asUser(adminAUserId, async () => {
      const { rows } = await client.query('select bootstrap_organization($1) as id', ['Org Append Only'])
      return rows[0].id
    })

    const person = await asUser(adminAUserId, async () => {
      const { rows } = await client.query(
        `select * from create_person_with_initial_salary($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [orgId, 'Javier', 'Ruiz', 'javier@test.local', null, 'Analista', null, null, '2024-01-01', 'indefinido', 28000, 'EUR'],
      )
      return rows[0]
    })

    await asUser(adminAUserId, async () => {
      await expect(
        client.query('update salary_records set gross_annual_salary = 99999 where person_id = $1', [person.id]),
      ).rejects.toThrow(/permission denied/i)
    })

    await asUser(adminAUserId, async () => {
      await expect(client.query('delete from salary_records where person_id = $1', [person.id])).rejects.toThrow(
        /permission denied/i,
      )
    })
  })

  it('un manager solo ve a las personas de su propio equipo', async () => {
    const adminAUserId = await createUser('admin-manager-scope')
    const managerUserId = await createUser('manager')
    const orgId = await asUser(adminAUserId, async () => {
      const { rows } = await client.query('select bootstrap_organization($1) as id', ['Org Manager Scope'])
      return rows[0].id
    })

    // El manager necesita su propia fila de `people` vinculada a su user_id para que
    // current_person_id() lo resuelva (docs/03-modelo-datos.md §3.10).
    const managerPerson = await asUser(adminAUserId, async () => {
      const { rows } = await client.query(
        `select * from create_person_with_initial_salary($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [orgId, 'Sara', 'Gómez', 'sara@test.local', null, 'Manager', null, null, '2022-01-01', 'indefinido', 40000, 'EUR'],
      )
      return rows[0]
    })
    await asUser(adminAUserId, () =>
      client.query('update people set user_id = $1 where id = $2', [managerUserId, managerPerson.id]),
    )
    // Sin policy de insert en memberships (docs/03-modelo-datos.md §3.10: solo se crean vía
    // bootstrap_organization() o, en el futuro, un flujo de invitación con security definer).
    await adminClient.query(`insert into memberships (organization_id, user_id, role) values ($1, $2, 'manager')`, [
      orgId,
      managerUserId,
    ])

    const directReport = await asUser(adminAUserId, async () => {
      const { rows } = await client.query(
        `select * from create_person_with_initial_salary($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [orgId, 'Mario', 'Iglesias', 'mario@test.local', null, 'Diseñador', null, managerPerson.id, '2024-06-01', 'indefinido', 26000, 'EUR'],
      )
      return rows[0]
    })

    const notManaged = await asUser(adminAUserId, async () => {
      const { rows } = await client.query(
        `select * from create_person_with_initial_salary($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [orgId, 'Elena', 'Castro', 'elena@test.local', null, 'Social Media', null, null, '2024-06-01', 'indefinido', 24000, 'EUR'],
      )
      return rows[0]
    })

    const visibleToManager = await asUser(managerUserId, async () => {
      const { rows } = await client.query('select id from people where organization_id = $1 order by first_name', [
        orgId,
      ])
      return rows.map((r) => r.id)
    })

    expect(visibleToManager).toContain(directReport.id)
    expect(visibleToManager).toContain(managerPerson.id) // se ve a sí misma
    expect(visibleToManager).not.toContain(notManaged.id)
  })
})
