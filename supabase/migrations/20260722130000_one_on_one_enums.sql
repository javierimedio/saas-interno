create type one_on_one_status as enum ('scheduled', 'preparing', 'in_progress', 'completed', 'cancelled');
create type meeting_mode as enum ('in_person', 'video', 'phone');
create type action_status as enum ('pending', 'in_progress', 'blocked', 'completed', 'cancelled');
create type action_priority as enum ('low', 'medium', 'high', 'urgent');
