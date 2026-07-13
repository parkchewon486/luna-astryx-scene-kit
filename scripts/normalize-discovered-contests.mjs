import { readFile, writeFile } from 'node:fs/promises';

const path = 'public/data/contests.json';
const payload = JSON.parse(await readFile(path, 'utf8'));

function cleanTitle(value = '') {
  return String(value)
    .replace(/^\s*\d+[.)]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanOrganizer(value = '') {
  return String(value)
    .replace(/^\s*(?:주최\s*\/\s*주관|주최·주관|주최|주관)\s*[:：.]?\s*/i, '')
    .replace(/\s*\/\s*/g, ' · ')
    .replace(/\s*,\s*/g, ' · ')
    .replace(/(?:\s*·\s*){2,}/g, ' · ')
    .replace(/^\s*[·:：,/]\s*|\s*[·:：,/]\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function cleanEligibility(value = '') {
  let result = String(value).replace(/\s+/g, ' ').trim();
  if (result.includes('▶')) result = result.split('▶').pop()?.trim() ?? result;
  result = result
    .replace(/^\s*[([▶·,:：-]+\s*/, '')
    .replace(/\s*[)\]]+\s*$/, '')
    .replace(/\s+,\s+/g, ', ')
    .replace(/^해당자\s*/i, '')
    .trim();
  return result.slice(0, 180) || '세부 참가 자격은 공식 모집 페이지에서 확인';
}

function validOfficialUrl(value) {
  try {
    const url = new URL(String(value));
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

const contests = Array.isArray(payload.contests)
  ? payload.contests.map((contest) => {
      if (!contest?.auto_discovered) return contest;
      const normalized = {
        ...contest,
        title: cleanTitle(contest.title),
        organizer: cleanOrganizer(contest.organizer),
        eligibility: cleanEligibility(contest.eligibility),
      };

      if (!normalized.title || !normalized.organizer || !validOfficialUrl(normalized.official_url)) {
        throw new Error(`자동 발굴 카드 정리 실패: ${contest.title || '제목 없음'}`);
      }
      if (/^(?:주최|주관)/.test(normalized.organizer) || normalized.organizer.includes('/')) {
        throw new Error(`기관명 정리 실패: ${normalized.title}`);
      }
      if (/^\d+[.)]\s*/.test(normalized.title) || /▶/.test(normalized.eligibility)) {
        throw new Error(`표시 문구 정리 실패: ${normalized.title}`);
      }
      return normalized;
    })
  : [];

await writeFile(path, `${JSON.stringify({ ...payload, contests }, null, 2)}\n`, 'utf8');
console.log(`Normalized ${contests.filter((contest) => contest?.auto_discovered).length} auto-discovered contests.`);
