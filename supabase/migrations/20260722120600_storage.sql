-- Storage de documentos (docs/02-arquitectura.md §2.6): carpeta organization_id/person_id,
-- políticas que replican el mismo alcance que la tabla `documents`.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy documents_bucket_select on storage.objects for select
using (
    bucket_id = 'documents'
    and (
        current_membership((storage.foldername(name))[1]::uuid) = 'admin'
        or (storage.foldername(name))[2]::uuid in (
            select id from people where manager_id = current_person_id((storage.foldername(name))[1]::uuid)
        )
    )
);

create policy documents_bucket_insert on storage.objects for insert
with check (
    bucket_id = 'documents'
    and current_membership((storage.foldername(name))[1]::uuid) in ('admin', 'manager')
);

create policy documents_bucket_delete on storage.objects for delete
using (
    bucket_id = 'documents'
    and current_membership((storage.foldername(name))[1]::uuid) in ('admin', 'manager')
);
