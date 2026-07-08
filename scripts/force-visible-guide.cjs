const fs = require('fs');

const file = 'src/App.tsx';
let app = fs.readFileSync(file, 'utf8');

function findMatchingTag(source, startIndex, tagName) {
  const re = new RegExp(`<\\/?${tagName}\\b[^>]*>`, 'g');
  re.lastIndex = startIndex;

  let depth = 0;
  let match;

  while ((match = re.exec(source)) !== null) {
    const tag = match[0];
    const isClosing = tag.startsWith(`</${tagName}`);
    const isSelfClosing = tag.endsWith('/>');

    if (!isClosing && !isSelfClosing) depth += 1;
    if (isClosing) depth -= 1;

    if (depth === 0) return re.lastIndex;
  }

  throw new Error(`${tagName} 닫는 태그를 찾지 못했습니다.`);
}

function findBlockByClass(source, tagName, className) {
  const re = new RegExp(`<${tagName}\\b[^>]*className=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`);
  const match = re.exec(source);

  if (!match) return null;

  const start = match.index;
  const end = findMatchingTag(source, start, tagName);

  return {
    start,
    end,
    block: source.slice(start, end)
  };
}

const guideBlock = `
          <section className="promptGuideInline" aria-label="Prompt recipe guide">
            <div className="guideHeader">
              <p className="kicker">PROMPT RECIPE GUIDE</p>
              <h2>복사한 다음 이렇게 쓰세요</h2>
            </div>

            <div className="guideGrid">
              <article className="guideCard">
                <span>01</span>
                <strong>이미지 툴</strong>
                <p>Image Prompt를 먼저 붙여넣고, Negative Prompt를 마지막에 추가하세요.</p>
              </article>

              <article className="guideCard">
                <span>02</span>
                <strong>영상 툴</strong>
                <p>Video Prompt와 Camera Note를 함께 쓰면 움직임과 렌즈가 더 안정적으로 잡힙니다.</p>
              </article>

              <article className="guideCard">
                <span>03</span>
                <strong>실패 방지</strong>
                <p>손 오류, 깨진 글자, 과한 줌, 플라스틱 피부는 Negative Prompt로 눌러주세요.</p>
              </article>
            </div>
          </section>`;

app = app.replace(/<section className="promptGuide"[\s\S]*?<\/section>/g, '');
app = app.replace(/<section className="promptGuideInline"[\s\S]*?<\/section>/g, '');

const result = findBlockByClass(app, 'section', 'resultPanel');

if (!result) {
  console.error('Prompt Output Board 영역을 찾지 못했습니다.');
  process.exit(1);
}

let resultBlock = result.block;
const actions = findBlockByClass(resultBlock, 'div', 'actions');

if (!actions) {
  console.error('복사 버튼 actions 영역을 찾지 못했습니다.');
  process.exit(1);
}

resultBlock =
  resultBlock.slice(0, actions.end) +
  guideBlock +
  resultBlock.slice(actions.end);

app = app.slice(0, result.start) + resultBlock + app.slice(result.end);

fs.writeFileSync(file, app, 'utf8');

console.log('Prompt Output Board 안쪽 하단에 가이드를 직접 추가했습니다.');
