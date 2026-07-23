create table action_comments (
    id uuid primary key default gen_random_uuid(),
    action_id uuid not null references actions(id) on delete cascade,
    author_id uuid not null references auth.users(id),
    comment text not null,
    created_at timestamptz not null default now()
);
create index idx_action_comments_action on action_comments(action_id, created_at);

alter table action_comments enable row level security;

create policy action_comments_select on action_comments for select
using (action_id in (select id from actions));

create policy action_comments_insert on action_comments for insert
with check (
    author_id = auth.uid()
    and action_id in (select id from actions)
);
