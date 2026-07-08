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

function replaceBlockByClass(source, tagName, className, newBlock) {
  const found = findBlockByClass(source, tagName, className);
  if (!found) return source;
  return source.slice(0, found.start) + newBlock + source.slice(found.end);
}

let controls = findBlockByClass(app, 'section', 'controlsPanel');
let result = findBlockByClass(app, 'section', 'resultPanel');
let preset = findBlockByClass(app, 'section', 'presetPanel');
let astryx = findBlockByClass(app, 'section', 'astryxPanel');
let mainGrid = findBlockByClass(app, 'section', 'mainGrid');

if (!controls || !result || !preset || !astryx || !mainGrid) {
  console.error('필수 영역을 찾지 못했습니다.');
  console.error({
    controls: Boolean(controls),
    result: Boolean(result),
    preset: Boolean(preset),
    astryx: Boolean(astryx),
    mainGrid: Boolean(mainGrid)
  });
  process.exit(1);
}

let astryxBlock = astryx.block;

astryxBlock = astryxBlock.replace(/className="astryxPanel[^"]*"/, 'className="astryxPanel toolInfoWide"');
astryxBlock = astryxBlock.replace(/<p className="kicker">.*?<\/p>/s, '<p className="kicker">ASTRYX BUILD NOTES</p>');
astryxBlock = astryxBlock.replace(/<h2>.*?<\/h2>/s, '<h2>Built with Astryx Y2K</h2>');

astryxBlock = replaceBlockByClass(
  astryxBlock,
  'div',
  'specGrid',
  `<div className="specGrid">
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
          </div>`
);

astryxBlock = replaceBlockByClass(
  astryxBlock,
  'div',
  'codeCard',
  `<div className="codeCard">
            <code>@astryxdesign/core</code>
            <code>@astryxdesign/theme-y2k</code>
            <code>Astryx Button</code>
            <code>Custom Prompt UI</code>
          </div>`
);

const newMainGrid = `      <section className="mainGrid">
${controls.block}

        <div className="rightStack">
${result.block}

${preset.block}
        </div>
      </section>`;

let bottomGrid = findBlockByClass(app, 'section', 'bottomGrid');

const newBottomGrid = `      <section className="bottomGrid">
${astryxBlock}
      </section>`;

app = app.slice(0, mainGrid.start) + newMainGrid + app.slice(mainGrid.end);

bottomGrid = findBlockByClass(app, 'section', 'bottomGrid');

if (bottomGrid) {
  app = app.slice(0, bottomGrid.start) + newBottomGrid + app.slice(bottomGrid.end);
} else {
  const mainGridAfter = findBlockByClass(app, 'section', 'mainGrid');
  app = app.slice(0, mainGridAfter.end) + `

${newBottomGrid}` + app.slice(mainGridAfter.end);
}

fs.writeFileSync(file, app, 'utf8');

console.log('완료: Preset Library는 오른쪽 Prompt Output Board 아래로 이동');
console.log('완료: Astryx Tool Info는 맨 아래 가로형으로 이동');
