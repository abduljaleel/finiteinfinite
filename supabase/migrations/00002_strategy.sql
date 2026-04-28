-- finiteinfinite: Strategy and game theory tables
-- Migration: 00002_strategy

-- Strategy Spaces
create table if not exists public.strategy_spaces (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  time_horizon text,
  status text,
  owner_id uuid references auth.users(id),
  thesis text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.strategy_spaces enable row level security;

create policy "Users can view strategy spaces in their org"
  on public.strategy_spaces for select
  using (org_id in (select org_id from public.profiles where user_id = auth.uid()));

create policy "Users can insert strategy spaces in their org"
  on public.strategy_spaces for insert
  with check (org_id in (select org_id from public.profiles where user_id = auth.uid()));

create policy "Users can update strategy spaces in their org"
  on public.strategy_spaces for update
  using (org_id in (select org_id from public.profiles where user_id = auth.uid()));

create policy "Users can delete strategy spaces in their org"
  on public.strategy_spaces for delete
  using (org_id in (select org_id from public.profiles where user_id = auth.uid()));

-- Games
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  strategy_space_id uuid not null references public.strategy_spaces(id) on delete cascade,
  name text not null,
  game_type text not null check (game_type in ('finite', 'infinite')),
  market text,
  stakes text not null check (stakes in ('low', 'medium', 'high', 'existential')),
  status text,
  rationale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.games enable row level security;

create policy "Users can view games via strategy space org"
  on public.games for select
  using (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));

create policy "Users can insert games via strategy space org"
  on public.games for insert
  with check (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));

create policy "Users can update games via strategy space org"
  on public.games for update
  using (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));

create policy "Users can delete games via strategy space org"
  on public.games for delete
  using (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));

-- Portfolio Items
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  strategy_space_id uuid not null references public.strategy_spaces(id) on delete cascade,
  name text not null,
  category text not null check (category in ('invest', 'maintain', 'harvest', 'divest')),
  allocation_pct numeric,
  confidence int,
  expected_outcome text,
  actual_outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_items enable row level security;

create policy "Users can view portfolio items via strategy space org"
  on public.portfolio_items for select
  using (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));

create policy "Users can insert portfolio items via strategy space org"
  on public.portfolio_items for insert
  with check (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));

create policy "Users can update portfolio items via strategy space org"
  on public.portfolio_items for update
  using (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));

create policy "Users can delete portfolio items via strategy space org"
  on public.portfolio_items for delete
  using (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));

-- Strategic Moves
create table if not exists public.strategic_moves (
  id uuid primary key default gen_random_uuid(),
  strategy_space_id uuid not null references public.strategy_spaces(id) on delete cascade,
  game_id uuid references public.games(id),
  title text not null,
  move_type text,
  status text,
  deadline timestamptz,
  owner_id uuid references auth.users(id),
  outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.strategic_moves enable row level security;

create policy "Users can view strategic moves via strategy space org"
  on public.strategic_moves for select
  using (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));

create policy "Users can insert strategic moves via strategy space org"
  on public.strategic_moves for insert
  with check (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));

create policy "Users can update strategic moves via strategy space org"
  on public.strategic_moves for update
  using (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));

create policy "Users can delete strategic moves via strategy space org"
  on public.strategic_moves for delete
  using (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));

-- Decision Log
create table if not exists public.decision_log (
  id uuid primary key default gen_random_uuid(),
  strategy_space_id uuid not null references public.strategy_spaces(id) on delete cascade,
  decision text not null,
  context text,
  alternatives_considered jsonb,
  rationale text,
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  review_date timestamptz,
  outcome text,
  created_at timestamptz not null default now()
);

alter table public.decision_log enable row level security;

create policy "Users can view decisions via strategy space org"
  on public.decision_log for select
  using (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));

create policy "Users can insert decisions via strategy space org"
  on public.decision_log for insert
  with check (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));

create policy "Users can update decisions via strategy space org"
  on public.decision_log for update
  using (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));

create policy "Users can delete decisions via strategy space org"
  on public.decision_log for delete
  using (strategy_space_id in (
    select id from public.strategy_spaces where org_id in (
      select org_id from public.profiles where user_id = auth.uid()
    )
  ));
