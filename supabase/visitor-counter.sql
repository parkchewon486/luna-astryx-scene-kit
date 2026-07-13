create table if not exists public.visitor_totals (
  id smallint primary key check (id = 1),
  today_date date not null,
  today_visits bigint not null default 0 check (today_visits >= 0),
  total_visits bigint not null default 0 check (total_visits >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.visitor_sessions (
  session_id text primary key,
  last_seen timestamptz not null default now(),
  constraint visitor_sessions_id_length check (char_length(session_id) between 1 and 80)
);

create index if not exists visitor_sessions_last_seen_idx
  on public.visitor_sessions (last_seen);

alter table public.visitor_totals enable row level security;
alter table public.visitor_sessions enable row level security;

revoke all on table public.visitor_totals from anon, authenticated;
revoke all on table public.visitor_sessions from anon, authenticated;

insert into public.visitor_totals (id, today_date, today_visits, total_visits)
values (1, (timezone('Asia/Seoul', now()))::date, 0, 0)
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
  v_today_visits bigint;
  v_total_visits bigint;
begin
  if p_session_id is null or char_length(trim(p_session_id)) = 0 or char_length(p_session_id) > 80 then
    raise exception 'invalid session id';
  end if;

  if p_event not in ('visit', 'heartbeat') then
    raise exception 'invalid visitor event';
  end if;

  insert into public.visitor_totals (id, today_date, today_visits, total_visits)
  values (1, v_today, 0, 0)
  on conflict (id) do nothing;

  update public.visitor_totals
  set
    today_date = v_today,
    today_visits = case
      when today_date <> v_today then case when p_event = 'visit' then 1 else 0 end
      else today_visits + case when p_event = 'visit' then 1 else 0 end
    end,
    total_visits = total_visits + case when p_event = 'visit' then 1 else 0 end,
    updated_at = now()
  where id = 1
  returning today_visits, total_visits
  into v_today_visits, v_total_visits;

  insert into public.visitor_sessions (session_id, last_seen)
  values (p_session_id, now())
  on conflict (session_id)
  do update set last_seen = excluded.last_seen;

  delete from public.visitor_sessions
  where last_seen < now() - interval '12 minutes';

  select count(*)
  into v_active
  from public.visitor_sessions
  where last_seen >= now() - interval '12 minutes';

  return jsonb_build_object(
    'active', v_active,
    'today', v_today_visits,
    'total', v_total_visits,
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
  v_today_visits bigint;
  v_total_visits bigint;
begin
  insert into public.visitor_totals (id, today_date, today_visits, total_visits)
  values (1, v_today, 0, 0)
  on conflict (id) do nothing;

  update public.visitor_totals
  set
    today_date = v_today,
    today_visits = case when today_date <> v_today then 0 else today_visits end,
    updated_at = now()
  where id = 1
  returning today_visits, total_visits
  into v_today_visits, v_total_visits;

  delete from public.visitor_sessions
  where last_seen < now() - interval '12 minutes';

  select count(*)
  into v_active
  from public.visitor_sessions
  where last_seen >= now() - interval '12 minutes';

  return jsonb_build_object(
    'active', v_active,
    'today', v_today_visits,
    'total', v_total_visits,
    'today_key', v_today,
    'available', true
  );
end;
$$;

revoke all on function public.record_visitor(text, text) from public, anon, authenticated;
revoke all on function public.get_visitor_stats() from public, anon, authenticated;
grant execute on function public.record_visitor(text, text) to service_role;
grant execute on function public.get_visitor_stats() to service_role;
