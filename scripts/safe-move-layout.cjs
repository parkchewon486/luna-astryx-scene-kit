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

  throw new Error(`닫는 ${tagName} 태그를 찾지 못했습니다.`);
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

const preset = findBlockByClass(app, 'section', 'presetPanel');
const result = findBlockByClass(app, 'section', 'resultPanel');

if (!preset) {
  console.error('Preset Library 영역을 찾지 못했습니다.');
  process.exit(1);
}

if (!result) {
  console.error('Prompt Output Board 영역을 찾지 못했습니다.');
  process.exit(1);
}

app = app.slice(0, preset.start) + app.slice(preset.end);

const resultAfterPresetRemoval = findBlockByClass(app, 'section', 'resultPanel');

const rightStack = `      <div className="rightStack">
${resultAfterPresetRemoval.block}

${preset.block}
      </div>`;

app =
  app.slice(0, resultAfterPresetRemoval.start) +
  rightStack +
  app.slice(resultAfterPresetRemoval.end);

app = app.replace(/className="astryxPanel(?![^"]*toolInfoWide)"/g, 'className="astryxPanel toolInfoWide"');

app = app.replaceAll('TOOL INFO', 'ASTRYX BUILD NOTES');
app = app.replaceAll('Tool Info', 'ASTRYX BUILD NOTES');
app = app.replaceAll('What this tool gives you', 'Built with Astryx Y2K');

const spec = findBlockByClass(app, 'div', 'specGrid');
if (spec) {
  const newSpec = `<div className="specGrid">
            <div>
              <span>Theme</span>
              <strong>Y2K</strong>
            </div>

            <div>
              <span>Component</span>
              <strong>Astryx Button</strong>
            </div>

            <div>
              <span>Stack</span>
              <strong>React + Vite</strong>
            </div>

            <div>
              <span>Custom UI</span>
              <strong>Prompt Controls</strong>
            </div>
          </div>`;

  app = app.slice(0, spec.start) + newSpec + app.slice(spec.end);
}

const codeCard = findBlockByClass(app, 'div', 'codeCard');
if (codeCard) {
  const newCodeCard = `<div className="codeCard">
            <code>@astryxdesign/core</code>
            <code>@astryxdesign/theme-y2k</code>
            <code>Astryx Button</code>
            <code>Custom Prompt UI</code>
          </div>`;

  app = app.slice(0, codeCard.start) + newCodeCard + app.slice(codeCard.end);
}

fs.writeFileSync(file, app, 'utf8');

console.log('Preset Library를 Prompt Output Board 아래로 이동했습니다.');
console.log('Astryx 정보 박스를 하단 가로형으로 정리했습니다.');
