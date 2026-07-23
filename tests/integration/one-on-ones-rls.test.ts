import { randomUUID } from 'node:crypto'
import { Client } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Integración real de RLS para one_on_ones/actions (docs/03-modelo-datos.md §3.10,
 * supabase/migrations/20260722160000_simplify_two_role_model.sql — modelo de dos roles:
 * admin gestiona todo, employee solo ve lo suyo). Requiere la misma base de datos
 * de pruebas que people-rls.test.ts — ver ./scripts/setup-test-db.sh.
 */
const connectionString = process.env.TEST_DATABASE_URL

describe.skipIf(!connectionString)('RLS de one_on_ones/actions (integración)', () => {
  let client: Client
  let adminClient: Client

  async function asUser<T>(userId: string, fn: () => Promise<T>): Promise<T> {
    await client.query("select set_config('app.current_user_id', $1, false)", [userId])
    return fn()
  }

  /** memberships no tiene policy de insert (docs/03-modelo-datos.md §3.10) — se crea vía
   * bootstrap_organization() o, en el futuro, un flujo de invitación. Para el fixture de este
   * test (vincular un empleado ya existente) se usa una conexión superusuario. */
  async function addMembership(orgId: string, userId: string, role: string) {
    await adminClient.query('insert into memberships (organization_id, user_id, role) values ($1, $2, $3)', [
      orgId,
      userId,
      role,
    ])
  }

  async function createUser(label: string): Promise<string> {
    const id = randomUUID()
    await client.query('insert into auth.users (id, email) values ($1, $2)', [id, `${label}-${id}@test.local`])
    return id
  }

  async function createPerson(orgId: string, name: string, managerId: string | null) {
    const { rows } = await client.query(
      `select * from create_person_with_initial_salary($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [orgId, name, 'Test', `${name.toLowerCase()}-${randomUUID()}@test.local`, null, 'Puesto', null, managerId, '2024-01-01', 'indefinido', 30000, 'EUR'],
    )
    return rows[0]
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

  it('el empleado ve sus propias reuniones (sin poder crearlas); otro admin de otra organización no', async () => {
    const adminId = await createUser('admin-ooo')
    const employeeUserId = await createUser('employee-ooo')
    const otherAdminId = await createUser('other-admin-ooo')

    const orgId = await asUser(adminId, async () => {
      const { rows } = await client.query('select bootstrap_organization($1) as id', ['Org OOO'])
      return rows[0].id
    })
    await asUser(otherAdminId, () => client.query('select bootstrap_organization($1)', ['Org OOO Other']))

    const adminPerson = await asUser(adminId, () => createPerson(orgId, 'Javier', null))
    const employeePerson = await asUser(adminId, () => createPerson(orgId, 'Empleado', null))
    await asUser(adminId, () =>
      client.query('update people set user_id = $1 where id = $2', [employeeUserId, employeePerson.id]),
    )
    await addMembership(orgId, employeeUserId, 'employee')

    const meeting = await asUser(adminId, async () => {
      const { rows } = await client.query(
        `insert into one_on_ones (organization_id, person_id, manager_id, scheduled_at, created_by)
         values ($1, $2, $3, now(), $4) returning *`,
        [orgId, employeePerson.id, adminPerson.id, adminId],
      )
      return rows[0]
    })

    const visibleToEmployee = await asUser(employeeUserId, async () => {
      const { rows } = await client.query('select id from one_on_ones where id = $1', [meeting.id])
      return rows
    })
    expect(visibleToEmployee).toHaveLength(1)

    // El empleado no puede crear reuniones propias: solo admin gestiona el ciclo de vida del One2One.
    await asUser(employeeUserId, async () => {
      await expect(
        client.query(
          `insert into one_on_ones (organization_id, person_id, manager_id, scheduled_at, created_by)
           values ($1, $2, $3, now(), $4)`,
          [orgId, employeePerson.id, adminPerson.id, employeeUserId],
        ),
      ).rejects.toThrow(/row-level security/i)
    })

    const visibleToOtherAdmin = await asUser(otherAdminId, async () => {
      const { rows } = await client.query('select id from one_on_ones where id = $1', [meeting.id])
      return rows
    })
    expect(visibleToOtherAdmin).toHaveLength(0)
  })

  it('los puntos de agenda heredan el alcance de la reunión; solo admin los gestiona', async () => {
    const adminId = await createUser('admin-agenda')
    const employeeUserId = await createUser('employee-agenda')
    const orgId = await asUser(adminId, async () => {
      const { rows } = await client.query('select bootstrap_organization($1) as id', ['Org Agenda'])
      return rows[0].id
    })
    const adminPerson = await asUser(adminId, () => createPerson(orgId, 'Javier2', null))
    const employeePerson = await asUser(adminId, () => createPerson(orgId, 'Empleado2', null))
    await asUser(adminId, () =>
      client.query('update people set user_id = $1 where id = $2', [employeeUserId, employeePerson.id]),
    )
    await addMembership(orgId, employeeUserId, 'employee')

    const meeting = await asUser(adminId, async () => {
      const { rows } = await client.query(
        `insert into one_on_ones (organization_id, person_id, manager_id, scheduled_at, created_by)
         values ($1, $2, $3, now(), $4) returning *`,
        [orgId, employeePerson.id, adminPerson.id, adminId],
      )
      return rows[0]
    })

    await asUser(adminId, () =>
      client.query('insert into one_on_one_agenda_items (one_on_one_id, topic, position) values ($1, $2, 0)', [
        meeting.id,
        'Tema de prueba',
      ]),
    )

    const items = await asUser(employeeUserId, async () => {
      const { rows } = await client.query('select * from one_on_one_agenda_items where one_on_one_id = $1', [meeting.id])
      return rows
    })
    expect(items).toHaveLength(1)

    // El propio empleado no puede insertar puntos de agenda: sin policy para su rol.
    await asUser(employeeUserId, async () => {
      await expect(
        client.query('insert into one_on_one_agenda_items (one_on_one_id, topic, position) values ($1, $2, 1)', [
          meeting.id,
          'Intento propio',
        ]),
      ).rejects.toThrow(/row-level security/i)
    })

    // Un admin de otra organización, sin relación con esta reunión, tampoco puede insertar en ella.
    const otherAdminUserId = await createUser('other-admin-agenda')
    const otherOrgId = await asUser(otherAdminUserId, async () => {
      const { rows } = await client.query('select bootstrap_organization($1) as id', ['Org Agenda Other'])
      return rows[0].id
    })
    void otherOrgId
    await asUser(otherAdminUserId, async () => {
      await expect(
        client.query('insert into one_on_one_agenda_items (one_on_one_id, topic, position) values ($1, $2, 1)', [
          meeting.id,
          'Intento ajeno',
        ]),
      ).rejects.toThrow(/row-level security/i)
    })
  })

  it('no existe policy de delete para one_on_ones (cancelar es un cambio de estado)', async () => {
    const adminId = await createUser('admin-nodelete')
    const orgId = await asUser(adminId, async () => {
      const { rows } = await client.query('select bootstrap_organization($1) as id', ['Org NoDelete'])
      return rows[0].id
    })
    const adminPerson = await asUser(adminId, () => createPerson(orgId, 'Javier3', null))
    const employeePerson = await asUser(adminId, () => createPerson(orgId, 'Empleado3', null))
    const meeting = await asUser(adminId, async () => {
      const { rows } = await client.query(
        `insert into one_on_ones (organization_id, person_id, manager_id, scheduled_at, created_by)
         values ($1, $2, $3, now(), $4) returning *`,
        [orgId, employeePerson.id, adminPerson.id, adminId],
      )
      return rows[0]
    })

    const deleted = await asUser(adminId, async () => {
      const result = await client.query('delete from one_on_ones where id = $1', [meeting.id])
      return result.rowCount
    })
    expect(deleted).toBe(0)
  })
})
