create table if not exists public.visitor_unique_sessions (
  session_id text primary key,
  first_seen timestamptz not null default now(),
  constraint visitor_unique_sessions_id_length check (char_length(session_id) between 1 and 80)
);

create table if not exists public.visitor_daily_sessions (
  visit_date date not null,
  session_id text not null,
  first_seen timestamptz not null default now(),
  primary key (visit_date, session_id),
  constraint visitor_daily_sessions_id_length check (char_length(session_id) between 1 and 80)
);

create table if not exists public.visitor_counter_baseline (
  id smallint primary key check (id = 1),
  today_date date not null,
  today_unique_baseline bigint not null default 0 check (today_unique_baseline >= 0),
  total_unique_baseline bigint not null default 0 check (total_unique_baseline >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists visitor_daily_sessions_date_idx
  on public.visitor_daily_sessions (visit_date);

alter table public.visitor_unique_sessions enable row level security;
alter table public.visitor_daily_sessions enable row level security;
alter table public.visitor_counter_baseline enable row level security;

revoke all on table public.visitor_unique_sessions from anon, authenticated;
revoke all on table public.visitor_daily_sessions from anon, authenticated;
revoke all on table public.visitor_counter_baseline from anon, authenticated;

-- 현재 활성 세션은 기존 집계에 이미 포함된 것으로 보고 새 고유 방문자 테이블에 옮깁니다.
insert into public.visitor_unique_sessions (session_id, first_seen)
select session_id, last_seen
from public.visitor_sessions
on conflict (session_id) do nothing;

insert into public.visitor_daily_sessions (visit_date, session_id, first_seen)
select (timezone('Asia/Seoul', last_seen))::date, session_id, last_seen
from public.visitor_sessions
on conflict (visit_date, session_id) do nothing;

-- 기존 Upstash 집계: 7/11 29명, 7/12 157명, 7/13 95명, 누적 시작값 281명.
-- 현재 활성 세션은 위에서 옮겼으므로 그 수만큼 기준값에서 빼 중복을 막습니다.
insert into public.visitor_counter_baseline (
  id,
  today_date,
  today_unique_baseline,
  total_unique_baseline
)
select
  1,
  (timezone('Asia/Seoul', now()))::date,
  greatest(
    95 - (
      select count(*)
      from public.visitor_daily_sessions
      where visit_date = (timezone('Asia/Seoul', now()))::date
    ),
    0
  ),
  greatest(
    281 - (select count(*) from public.visitor_unique_sessions),
    0
  )
on conflict (id) do nothing;

create or replace function public.record_visitor(
  p_session_id text,
  p_event text default 'heartbeat'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (timezone('Asia/Seoul', now()))::date;
  v_active bigint;
  v_today_unique bigint;
  v_total_unique bigint;
  v_today_baseline bigint;
  v_total_baseline bigint;
begin
  if p_session_id is null or char_length(trim(p_session_id)) = 0 or char_length(p_session_id) > 80 then
    raise exception 'invalid session id';
  end if;

  if p_event not in ('visit', 'heartbeat') then
    raise exception 'invalid visitor event';
  end if;

  insert into public.visitor_counter_baseline (
    id,
    today_date,
    today_unique_baseline,
    total_unique_baseline
  )
  values (1, v_today, 0, 0)
  on conflict (id) do nothing;

  update public.visitor_counter_baseline
  set
    today_date = v_today,
    today_unique_baseline = case
      when today_date <> v_today then 0
      else today_unique_baseline
    end,
    updated_at = now()
  where id = 1;

  insert into public.visitor_sessions (session_id, last_seen)
  values (p_session_id, now())
  on conflict (session_id)
  do update set last_seen = excluded.last_seen;

  insert into public.visitor_unique_sessions (session_id, first_seen)
  values (p_session_id, now())
  on conflict (session_id) do nothing;

  insert into public.visitor_daily_sessions (visit_date, session_id, first_seen)
  values (v_today, p_session_id, now())
  on conflict (visit_date, session_id) do nothing;

  delete from public.visitor_sessions
  where last_seen < now() - interval '12 minutes';

  select count(*)
  into v_active
  from public.visitor_sessions
  where last_seen >= now() - interval '12 minutes';

  select count(*)
  into v_today_unique
  from public.visitor_daily_sessions
  where visit_date = v_today;

  select count(*)
  into v_total_unique
  from public.visitor_unique_sessions;

  select today_unique_baseline, total_unique_baseline
  into v_today_baseline, v_total_baseline
  from public.visitor_counter_baseline
  where id = 1;

  return jsonb_build_object(
    'active', v_active,
    'today', v_today_baseline + v_today_unique,
    'total', v_total_baseline + v_total_unique,
    'today_key', v_today,
    'available', true
  );
end;
$$;

create or replace function public.get_visitor_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (timezone('Asia/Seoul', now()))::date;
  v_active bigint;
  v_today_unique bigint;
  v_total_unique bigint;
  v_today_baseline bigint;
  v_total_baseline bigint;
begin
  insert into public.visitor_counter_baseline (
    id,
    today_date,
    today_unique_baseline,
    total_unique_baseline
  )
  values (1, v_today, 0, 0)
  on conflict (id) do nothing;

  update public.visitor_counter_baseline
  set
    today_date = v_today,
    today_unique_baseline = case
      when today_date <> v_today then 0
      else today_unique_baseline
    end,
    updated_at = now()
  where id = 1;

  delete from public.visitor_sessions
  where last_seen < now() - interval '12 minutes';

  select count(*)
  into v_active
  from public.visitor_sessions
  where last_seen >= now() - interval '12 minutes';

  select count(*)
  into v_today_unique
  from public.visitor_daily_sessions
  where visit_date = v_today;

  select count(*)
  into v_total_unique
  from public.visitor_unique_sessions;

  select today_unique_baseline, total_unique_baseline
  into v_today_baseline, v_total_baseline
  from public.visitor_counter_baseline
  where id = 1;

  return jsonb_build_object(
    'active', v_active,
    'today', v_today_baseline + v_today_unique,
    'total', v_total_baseline + v_total_unique,
    'today_key', v_today,
    'available', true
  );
end;
$$;

revoke all on function public.record_visitor(text, text) from public, anon, authenticated;
revoke all on function public.get_visitor_stats() from public, anon, authenticated;
grant execute on function public.record_visitor(text, text) to service_role;
grant execute on function public.get_visitor_stats() to service_role;