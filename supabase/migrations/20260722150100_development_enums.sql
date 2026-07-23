create type goal_status as enum ('on_track', 'at_risk', 'off_track', 'completed', 'cancelled');
create type training_status as enum ('planned', 'in_progress', 'completed', 'cancelled');
create type feedback_visibility as enum ('manager_only', 'shared_with_employee');
