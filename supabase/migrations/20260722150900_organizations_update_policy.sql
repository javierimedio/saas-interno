create policy organizations_update on organizations for update
using (current_membership(id) = 'admin')
with check (current_membership(id) = 'admin');

create policy departments_delete on departments for delete
using (current_membership(organization_id) = 'admin');
