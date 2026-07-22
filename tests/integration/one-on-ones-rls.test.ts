import { randomUUID } from 'node:crypto'
import { Client } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Integración real de RLS para one_on_ones/actions (docs/03-modelo-datos.md §3.10,
 * supabase/migrations/20260722130300_one_on_one_rls.sql). Requiere la misma base de datos
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
   * test (vincular un manager ya existente) se usa una conexión superusuario. */
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

  it('el manager ve sus propias reuniones; otro admin de otra organización no', async () => {
    const adminId = await createUser('admin-ooo')
    const managerUserId = await createUser('manager-ooo')
    const otherAdminId = await createUser('other-admin-ooo')

    const orgId = await asUser(adminId, async () => {
      const { rows } = await client.query('select bootstrap_organization($1) as id', ['Org OOO'])
      return rows[0].id
    })
    await asUser(otherAdminId, () => client.query('select bootstrap_organization($1)', ['Org OOO Other']))

    const manager = await asUser(adminId, () => createPerson(orgId, 'Manager', null))
    await asUser(adminId, () =>
      client.query('update people set user_id = $1 where id = $2', [managerUserId, manager.id]),
    )
    await addMembership(orgId, managerUserId, 'manager')
    const employee = await asUser(adminId, () => createPerson(orgId, 'Empleado', manager.id))

    const meeting = await asUser(managerUserId, async () => {
      const { rows } = await client.query(
        `insert into one_on_ones (organization_id, person_id, manager_id, scheduled_at, created_by)
         values ($1, $2, $3, now(), $4) returning *`,
        [orgId, employee.id, manager.id, managerUserId],
      )
      return rows[0]
    })

    const visibleToManager = await asUser(managerUserId, async () => {
      const { rows } = await client.query('select id from one_on_ones where id = $1', [meeting.id])
      return rows
    })
    expect(visibleToManager).toHaveLength(1)

    const visibleToOtherAdmin = await asUser(otherAdminId, async () => {
      const { rows } = await client.query('select id from one_on_ones where id = $1', [meeting.id])
      return rows
    })
    expect(visibleToOtherAdmin).toHaveLength(0)
  })

  it('los puntos de agenda heredan el alcance de la reunión', async () => {
    const adminId = await createUser('admin-agenda')
    const managerUserId = await createUser('manager-agenda')
    const orgId = await asUser(adminId, async () => {
      const { rows } = await client.query('select bootstrap_organization($1) as id', ['Org Agenda'])
      return rows[0].id
    })
    const manager = await asUser(adminId, () => createPerson(orgId, 'Manager2', null))
    await asUser(adminId, () =>
      client.query('update people set user_id = $1 where id = $2', [managerUserId, manager.id]),
    )
    await addMembership(orgId, managerUserId, 'manager')
    const employee = await asUser(adminId, () => createPerson(orgId, 'Empleado2', manager.id))

    const meeting = await asUser(managerUserId, async () => {
      const { rows } = await client.query(
        `insert into one_on_ones (organization_id, person_id, manager_id, scheduled_at, created_by)
         values ($1, $2, $3, now(), $4) returning *`,
        [orgId, employee.id, manager.id, managerUserId],
      )
      return rows[0]
    })

    await asUser(managerUserId, () =>
      client.query('insert into one_on_one_agenda_items (one_on_one_id, topic, position) values ($1, $2, 0)', [
        meeting.id,
        'Tema de prueba',
      ]),
    )

    const items = await asUser(managerUserId, async () => {
      const { rows } = await client.query('select * from one_on_one_agenda_items where one_on_one_id = $1', [meeting.id])
      return rows
    })
    expect(items).toHaveLength(1);

    // Un manager de otra organización, sin relación con esta reunión, no puede insertar en ella.
    const otherManagerUserId = await createUser('other-manager-agenda')
    const otherOrgId = await asUser(otherManagerUserId, async () => {
      const { rows } = await client.query('select bootstrap_organization($1) as id', ['Org Agenda Other'])
      return rows[0].id
    })
    void otherOrgId
    await asUser(otherManagerUserId, async () => {
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
    const manager = await asUser(adminId, () => createPerson(orgId, 'Manager3', null))
    const employee = await asUser(adminId, () => createPerson(orgId, 'Empleado3', manager.id))
    const meeting = await asUser(adminId, async () => {
      const { rows } = await client.query(
        `insert into one_on_ones (organization_id, person_id, manager_id, scheduled_at, created_by)
         values ($1, $2, $3, now(), $4) returning *`,
        [orgId, employee.id, manager.id, adminId],
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
