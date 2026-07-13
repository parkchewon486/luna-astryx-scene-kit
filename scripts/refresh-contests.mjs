import { readFile, writeFile } from 'node:fs/promises';

const path = 'public/data/contests.json';
const payload = JSON.parse(await readFile(path, 'utf8'));
const now = new Date();
const timeoutMs = 12_000;

function kstDateKey(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function dayNumber(key) {
  const [year, month, day] = key.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

async function checkSource(url) {
  if (!url) return { state: 'missing', checked_at: now.toISOString() };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/json;q=0.8,*/*;q=0.5',
        'User-Agent': 'Mozilla/5.0 (compatible; LunaContestRadar/1.0; +https://lunakim-studio.vercel.app)',
      },
    });
    return {
      state: response.ok ? 'reachable' : 'http_error',
      http_status: response.status,
      checked_at: now.toISOString(),
    };
  } catch (error) {
    return {
      state: error?.name === 'AbortError' ? 'timeout' : 'unreachable',
      checked_at: now.toISOString(),
    };
  } finally {
    clearTimeout(timer);
  }
}

const today = dayNumber(kstDateKey(now));
const contests = Array.isArray(payload.contests) ? payload.contests : [];
const refreshed = [];

for (const contest of contests) {
  const deadline = contest.deadline ? new Date(contest.deadline) : null;
  const validDeadline = deadline && !Number.isNaN(deadline.getTime());
  const expired = validDeadline ? deadline.getTime() < now.getTime() : false;
  const dDay = validDeadline
    ? Math.max(0, dayNumber(kstDateKey(deadline)) - today)
    : contest.d_day;
  const sourceCheck = await checkSource(contest.official_url || contest.source_url);

  refreshed.push({
    ...contest,
    d_day: dDay,
    status: expired ? 'closed' : contest.status === 'closed' ? 'closed' : 'open',
    source_check: sourceCheck,
  });
}

const output = {
  ...payload,
  generated_at: now.toISOString(),
  schedule: 'twice-daily',
  contests: refreshed,
};

await writeFile(path, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Refreshed ${refreshed.length} contest records at ${output.generated_at}`);
