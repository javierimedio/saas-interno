import { randomUUID } from 'node:crypto'
import { Client } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Integración real de link_or_bootstrap_membership() (docs/06-roadmap.md: autenticación
 * definitiva). Sustituye a bootstrap_organization() como punto de entrada del primer login:
 * si el email coincide con una persona ya dada de alta por un admin y todavía sin user_id,
 * vincula esa persona como employee en su organización; si no, crea una organización nueva
 * con el usuario como admin (comportamiento de bootstrap_organization preservado).
 * Requiere la misma base de datos de pruebas que people-rls.test.ts — ver ./scripts/setup-test-db.sh.
 */
const connectionString = process.env.TEST_DATABASE_URL

describe.skipIf(!connectionString)('link_or_bootstrap_membership (integración)', () => {
  let client: Client

  async function asUser<T>(userId: string, fn: () => Promise<T>): Promise<T> {
    await client.query("select set_config('app.current_user_id', $1, false)", [userId])
    return fn()
  }

  async function createUser(label: string, email?: string): Promise<{ id: string; email: string }> {
    const id = randomUUID()
    const userEmail = email ?? `${label}-${id}@test.local`
    await client.query('insert into auth.users (id, email) values ($1, $2)', [id, userEmail])
    return { id, email: userEmail }
  }

  beforeAll(async () => {
    client = new Client({ connectionString })
    await client.connect()
  })

  afterAll(async () => {
    await client.end()
  })

  it('vincula a un empleado con una ficha pendiente en lugar de crearle una organización nueva', async () => {
    const admin = await createUser('admin-link')
    const orgId = await asUser(admin.id, async () => {
      const { rows } = await client.query('select link_or_bootstrap_membership($1, $2) as id', [admin.email, 'Org Link'])
      return rows[0].id
    })

    const adminRole = await asUser(admin.id, async () => {
      const { rows } = await client.query('select role from memberships where user_id = $1', [admin.id])
      return rows[0].role
    })
    expect(adminRole).toBe('admin')

    const pendingEmail = `pendiente-${randomUUID()}@empresa.local`
    const pendingPerson = await asUser(admin.id, async () => {
      const { rows } = await client.query(
        `select * from create_person_with_initial_salary($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [orgId, 'Empleada', 'Pendiente', pendingEmail, null, 'Growth Marketer', null, null, '2024-01-01', 'indefinido', 28000, 'EUR'],
      )
      return rows[0]
    })
    expect(pendingPerson.user_id).toBeNull()

    const employee = await createUser('employee-link', pendingEmail)
    const linkedOrgId = await asUser(employee.id, async () => {
      const { rows } = await client.query('select link_or_bootstrap_membership($1, $2) as id', [
        employee.email,
        'Org que nunca debería crearse',
      ])
      return rows[0].id
    })
    expect(linkedOrgId).toBe(orgId)

    const employeeRole = await asUser(employee.id, async () => {
      const { rows } = await client.query('select role from memberships where user_id = $1 and organization_id = $2', [
        employee.id,
        orgId,
      ])
      return rows[0]?.role
    })
    expect(employeeRole).toBe('employee')

    const linkedPerson = await asUser(admin.id, async () => {
      const { rows } = await client.query('select user_id from people where id = $1', [pendingPerson.id])
      return rows[0]
    })
    expect(linkedPerson.user_id).toBe(employee.id)
  })

  it('crea una organización nueva como admin cuando no hay ninguna ficha pendiente con ese email', async () => {
    const user = await createUser('admin-fresh')
    const orgId = await asUser(user.id, async () => {
      const { rows } = await client.query('select link_or_bootstrap_membership($1, $2) as id', [user.email, 'Org Fresh'])
      return rows[0].id
    })

    const membership = await asUser(user.id, async () => {
      const { rows } = await client.query('select role, organization_id from memberships where user_id = $1', [user.id])
      return rows[0]
    })
    expect(membership.role).toBe('admin')
    expect(membership.organization_id).toBe(orgId)
  })

  it('un usuario que ya pertenece a una organización no puede volver a vincularse', async () => {
    const user = await createUser('admin-twice')
    await asUser(user.id, () => client.query('select link_or_bootstrap_membership($1, $2)', [user.email, 'Org Twice']))

    await asUser(user.id, async () => {
      await expect(
        client.query('select link_or_bootstrap_membership($1, $2)', [user.email, 'Org Twice 2']),
      ).rejects.toThrow(/ya pertenece a una organización/i)
    })
  })
})
