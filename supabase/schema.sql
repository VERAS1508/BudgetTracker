-- Budget Tracker Schema

create table categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz default now()
);

create table expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  amount decimal(10,2) not null check (amount > 0),
  description text not null,
  date date not null default current_date,
  created_at timestamptz default now()
);

alter table categories enable row level security;
alter table expenses enable row level security;

create policy "users_own_categories" on categories
  for all using (auth.uid() = user_id);

create policy "users_own_expenses" on expenses
  for all using (auth.uid() = user_id);
