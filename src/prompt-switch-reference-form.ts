type ReferenceTool = 'gemini' | 'gpt' | 'midjourney' | 'grok';
type PromptStrength = 'lock' | 'tidy' | 'optimize';
type ReferenceResult = { prompt: string; settings: string; note: string };
type PromptParts = { subject: string[]; scene: string[]; camera: string[]; look: string[]; text: string[]; avoidSentences: string[] };

const ROOT_ID = 'prompt-switch-root';
const tools: Array<[ReferenceTool, string]> = [['gemini','Gemini'],['gpt','GPT'],['midjourney','Midjourney'],['grok','Grok']];

function esc(value: unknown) { return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
function clean(value: string) { return value.replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim(); }
function cleanSentence(value: string) { return value.replace(/^\s*(?:[-•*]\s+|\d+[.)]\s+)/u,'').replace(/\s+/g,' ').replace(/[。.!?！？]+$/u,'').trim(); }
function tokens(value: string) { return new Set(value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').split(/\s+/).filter((token)=>token.length>1)); }
function similarity(a: string,b: string) { const aa=tokens(a),bb=tokens(b); if(!aa.size||!bb.size)return 0; let common=0; aa.forEach((token)=>{if(bb.has(token))common+=1}); return common/Math.min(aa.size,bb.size); }
function unique(items: string[]) { const out:string[]=[]; items.forEach((item)=>{const value=cleanSentence(item);if(!value)return;const index=out.findIndex((existing)=>similarity(existing,value)>=.78);if(index<0)out.push(value);else if(value.length>out[index].length)out[index]=value});return out; }
function split(source: string) { return unique(clean(source).replace(/\n+/g,'. ').split(/(?<=[。.!?！？])\s+|;\s*/u)); }
function avoidSentence(value: string) { return /(금지|제외|없게|없도록|말아|않게|않도록|avoid|without|\bno\b|distort|extra finger|watermark|깨짐|오류)/i.test(value); }

function analyze(source: string): PromptParts {
  const parts:PromptParts={subject:[],scene:[],camera:[],look:[],text:[],avoidSentences:[]};
  split(source).forEach((item)=>{
    if(avoidSentence(item))parts.avoidSentences.push(item);
    else if(/(문구|텍스트|글자|로고|라벨|title|caption|typography)/i.test(item))parts.text.push(item);
    else if(/(아이폰|스마트폰|카메라|렌즈|구도|프레이밍|셀카|스냅|촬영|샷|클로즈업|전신|미디엄|광각|망원|심도|비율|aspect|portrait|close[- ]?up|full[- ]?body|composition)/i.test(item))parts.camera.push(item);
    else if(/(조명|빛|색감|필름|피부|질감|재질|리얼|실사|포토리얼|무드|분위기|채도|콘트라스트|그레인|lighting|color|texture|realistic|photoreal|mood|film)/i.test(item))parts.look.push(item);
    else if(/(인물|여성|남성|사람|캐릭터|주인공|모델|얼굴|헤어|머리|체형|의상|동물|제품|병|object|person|woman|man|character|subject)/i.test(item))parts.subject.push(item);
    else parts.scene.push(item);
  });
  return parts;
}

function stripRatio(value: string) { return value.replace(/(?:이미지\s*)?(?:비율|aspect ratio)?\s*[:：]?\s*\d{1,2}\s*[:：]\s*\d{1,2}(?:\s*비율)?/gi,'').replace(/\.\s*\.$/g,'.').replace(/\s{2,}/g,' ').replace(/^\s*[,·/]\s*|\s*[,·/]\s*$/g,'').trim(); }
function visualPhrase(value: string) { return stripRatio(value).replace(/^(?:내|이|이건)\s*(?:캐릭터\s*)?(?:이미지|사진)(?:야|입니다|예요|이에요)?$/u,'').replace(/^(?:이|내)\s*캐릭터(?:의)?\s*실제\s*모습(?:이|을)?\s*(?:보고\s*싶어|원해)?$/u,'').replace(/^(?:나는|내가)\s+/u,'').replace(/(?:이미지를?|사진을?|장면을?)\s*(?:만들어|생성해|그려)\s*(?:줘|주세요)?/gu,'').replace(/(?:보고\s*싶어|원해|원합니다)$/u,'').replace(/(?:나와야\s*해|표현해\s*줘|표현해\s*주세요|해\s*줘|해주세요|해줘)$/u,'').replace(/\s{2,}/g,' ').trim(); }
function optimizedPhrase(value: string) { return visualPhrase(value).replace(/(?:정말|진짜)\s*/gu,'').replace(/\s{2,}/g,' ').trim(); }
function compact(parts: PromptParts, strength: PromptStrength, source: string) {
  if(strength==='lock')return stripRatio(clean(source));
  const transform=strength==='optimize'?optimizedPhrase:visualPhrase;
  const ordered=[...parts.subject,...parts.scene,...parts.camera,...parts.look,...parts.text].map(transform).filter(Boolean);
  return unique(ordered).join(', ')||clean(source);
}
function lines(items: string[],fallback='') { const values=unique(items.map(stripRatio)).filter(Boolean); return values.length?values.map((item)=>`- ${item}`).join('\n'):fallback; }
function noTerms(parts: PromptParts,addSafeguards:boolean) { const joined=parts.avoidSentences.join(' ').toLowerCase(),terms:string[]=[];const add=(condition:boolean,value:string)=>{if(condition&&!terms.includes(value))terms.push(value)};add(/손|손가락|finger|hand/.test(joined),'extra fingers');add(/중복|복제|duplicate/.test(joined),'duplicate subjects');add(/글자|문구|텍스트|text|caption/.test(joined),'unreadable text');add(/워터마크|watermark/.test(joined),'watermark');add(/로고|logo/.test(joined),'random logos');add(/왜곡|비대칭|distort|asymmetr/.test(joined),'distorted anatomy');if(addSafeguards)['extra fingers','duplicate subjects','unreadable text','watermark'].forEach((term)=>add(true,term));return terms; }
function identityKo(keep:boolean,wardrobe:boolean) { return [keep?'첨부한 레퍼런스 이미지 속 주인공의 얼굴 특징, 얼굴형, 나이 인상, 헤어와 자연스러운 체형 비율을 유지하세요.':'',wardrobe?'원문이 변경을 요구하지 않는 한 레퍼런스의 의상 디자인, 색상, 소재, 핏과 액세서리를 유지하세요.':''].filter(Boolean).join(' '); }
function identityEn(keep:boolean,wardrobe:boolean) { return [keep?'Treat the attached reference image as the authoritative identity source. Preserve the same facial features, face shape, age impression, hairstyle, and natural body proportions.':'',wardrobe?'Preserve the reference wardrobe, colors, materials, fit, and accessories unless the brief changes them.':''].filter(Boolean).join(' '); }
function gptSize(ratio:string) { if(ratio==='1:1')return'1024x1024';if(ratio==='4:5')return'1024x1280';if(ratio==='3:4')return'960x1280';if(ratio==='9:16')return'1152x2048';return'2048x1152'; }

function build(source:string,ratio:string,strength:PromptStrength,keepIdentity:boolean,keepWardrobe:boolean,addSafeguards:boolean):Record<ReferenceTool,ReferenceResult>{
  const parts=analyze(source),ko=identityKo(keepIdentity,keepWardrobe),en=identityEn(keepIdentity,keepWardrobe),compressed=compact(parts,strength,source),constraints=lines(parts.avoidSentences),no=noTerms(parts,addSafeguards);
  const transform=strength==='lock'?stripRatio:strength==='optimize'?optimizedPhrase:visualPhrase;
  const section=(items:string[])=>unique(items.map(transform).filter(Boolean));
  const subjectScene=section([...parts.subject,...parts.scene]),camera=section(parts.camera),look=section(parts.look),visible=section(parts.text);
  const hasSections=subjectScene.length||camera.length||look.length||visible.length;
  const primary=subjectScene.length?subjectScene:hasSections?[]:[compressed];
  const gemini=[ko,'다음 요구를 하나의 이미지로 생성하세요. 장면의 목적과 촬영 의도를 먼저 이해한 뒤, 아래 순서대로 세부 요소를 반영하세요.',primary.length?`1. 주인공과 핵심 장면\n${lines(primary)}`:'',look.length?`2. 빛·색감·질감\n${lines(look)}`:'',camera.length?`3. 카메라와 화면 구성\n${lines(camera)}`:'',visible.length?`4. 화면 속 문구\n${lines(visible)}`:'',constraints?`5. 지켜야 할 조건\n${constraints}`:'',`출력은 ${ratio} 비율로 구성하세요. 원문에 없는 미화나 화보식 보정을 추가하지 마세요.`].filter(Boolean).join('\n\n');
  const gpt=['Create a new image using the attached reference image and the brief below.',en,primary.length?`SUBJECT AND SCENE\n${lines(primary)}`:'',camera.length?`CAMERA AND COMPOSITION\n${lines(camera)}`:'',look.length?`LIGHTING, COLOR, AND SURFACE\n${lines(look)}`:'',visible.length?`VISIBLE TEXT\n${lines(visible)}`:'',constraints?`CONSTRAINTS\n${constraints}`:'',`OUTPUT\n- Aspect ratio: ${ratio}\n- Keep intentional candidness and imperfections. Do not add beauty retouching or editorial polish unless requested.`].filter(Boolean).join('\n\n');
  const midjourney=[compressed,`--ar ${ratio}`,keepIdentity?'--ow 100':'',no.length?`--no ${no.join(', ')}`:''].filter(Boolean).join(' ');
  const grok=[`Create a new ${ratio} image from the attached source image.`,keepIdentity?'Keep the same person, facial features, hairstyle, age impression, and natural proportions from the source image.':'',keepWardrobe?'Keep the source wardrobe and accessories unless the request changes them.':'',compressed,constraints?`Follow these constraints: ${parts.avoidSentences.join('; ')}.`:''].filter(Boolean).join(' ');
  return {
    gemini:{prompt:gemini,settings:`model: gemini-3.1-flash-image\ninput: text + 1 reference image\nresponse_format.type: image\naspect_ratio: ${ratio}\nimage_size: 2K`,note:'Google의 사진 프롬프트 순서에 맞춰 피사체·장소, 빛, 카메라 정보를 구체적으로 정리했어요.'},
    gpt:{prompt:gpt,settings:`model: gpt-image-2\nendpoint: images/edits\nreference images: 1\nsize: ${gptSize(ratio)}\nquality: high\ninput_fidelity: omit (automatic high fidelity)`,note:'참조 이미지 편집 워크플로와 명시적 섹션 구성을 반영했어요.'},
    midjourney:{prompt:midjourney,settings:`version: V7 only\nreference: ${keepIdentity?'Omni Reference':'Image Prompt'}\nreference images: 1\n${keepIdentity?'omni weight: --ow 100 (default)\n':''}aspect ratio: --ar ${ratio}\nparameters: prompt end`,note:'명확한 텍스트 프롬프트와 Omni Reference 한 장을 함께 쓰고, 기본 가중치와 비율 파라미터를 끝에 배치했어요.'},
    grok:{prompt:grok,settings:`model: grok-imagine-image-quality\nendpoint: /v1/images/edits\nrequest: application/json\nsource images: 1\naspect ratio: requested in prompt (${ratio})`,note:'xAI 방식에 맞춰 소스 이미지와 직접적인 자연어 변경 요청을 함께 전달하도록 정리했어요.'},
  };
}

function settingsLabel(tool:ReferenceTool){if(tool==='midjourney')return'OFFICIAL PARAMETERS';if(tool==='gemini')return'GEMINI SETTINGS';if(tool==='gpt')return'GPT IMAGE SETTINGS';return'XAI EDIT SETTINGS';}
function docsUrl(tool:ReferenceTool){if(tool==='gemini')return'https://ai.google.dev/gemini-api/docs/image-generation';if(tool==='gpt')return'https://developers.openai.com/api/docs/guides/image-generation';if(tool==='midjourney')return'https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference';return'https://docs.x.ai/developers/model-capabilities/images/editing';}
function render(root:HTMLElement,results:Record<ReferenceTool,ReferenceResult>){const target=root.querySelector<HTMLElement>('[data-switch-result]');if(!target)return;target.innerHTML=`<div class="promptSwitchTabs" role="tablist">${tools.map(([tool,label],index)=>`<button type="button" role="tab" data-switch-tool="${tool}" class="${index===0?'active':''}" aria-selected="${index===0}">${label}</button>`).join('')}</div>${tools.map(([tool,label],index)=>{const item=results[tool];return`<article class="promptSwitchOutput ${index===0?'active':''}" data-switch-output="${tool}"><div class="promptSwitchOutputTop"><div><small>${label.toUpperCase()} · MANUFACTURER METHOD</small><strong>제조사 방식 변환 결과</strong></div><button type="button" data-switch-copy="${tool}">복사</button></div><pre data-switch-prompt="${tool}">${esc(item.prompt)}</pre><div class="promptSwitchSetting"><small>${settingsLabel(tool)}</small><pre>${esc(item.settings)}</pre></div><p class="promptSwitchNote">${esc(item.note)}</p><a href="${docsUrl(tool)}" target="_blank" rel="noreferrer">반영한 공식 문서 보기 ↗</a></article>`}).join('')}`;}

function decorate(root:HTMLElement){root.dataset.referenceForm='5';const identity=root.querySelector<HTMLElement>('[data-switch-identity] + span');if(identity)identity.textContent='레퍼런스 인물 사용';const wardrobe=root.querySelector<HTMLElement>('[data-switch-wardrobe] + span');if(wardrobe)wardrobe.textContent='레퍼런스 의상 유지';const negative=root.querySelector<HTMLSelectElement>('[data-switch-negative]');if(negative){const normal=negative.querySelector<HTMLOptionElement>('option[value="normal"]'),strong=negative.querySelector<HTMLOptionElement>('option[value="strong"]');if(normal)normal.textContent='원문 제외만';if(strong)strong.textContent='기본 오류 방지 추가';if(root.dataset.referenceNegativeReady!=='5'){negative.value='normal';root.dataset.referenceNegativeReady='5';}}
  const controls=root.querySelector<HTMLElement>('.promptSwitchControls');if(controls&&!controls.querySelector('[data-switch-strength]'))controls.insertAdjacentHTML('beforeend','<label class="promptSwitchSelect promptSwitchStrength">변환 방식<select data-switch-strength><option value="lock" selected>원문 잠금</option><option value="tidy">가볍게 정리</option><option value="optimize">이미지 최적화</option></select></label>');
  const card=root.querySelector<HTMLElement>('.promptSwitchInputCard'),label=card?.querySelector<HTMLElement>('label[for="prompt-switch-input"]'),guide=card?.querySelector<HTMLElement>('[data-reference-form-guide]');const html='<b>MANUFACTURER METHOD · 1 REFERENCE</b><span>실제 생성할 AI에 레퍼런스 이미지 1장을 먼저 첨부하세요. 같은 원문을 복사하지 않고 Gemini·GPT Image·Midjourney·Grok의 제조사 사용법에 맞게 서로 다른 형태로 변환합니다.</span><small>기본값은 원문에 적힌 제외 조건만 사용합니다.</small>';if(guide)guide.innerHTML=html;else if(label)label.insertAdjacentHTML('afterend',`<div class="promptSwitchReferenceGuide" data-reference-form-guide>${html}</div>`);const input=root.querySelector<HTMLTextAreaElement>('#prompt-switch-input');if(input)input.placeholder='원본 프롬프트를 붙여 넣어 주세요.\n\n각 AI 제조사의 프롬프트 방식으로 재구성합니다.';
}

function bind(root:HTMLElement){decorate(root);if(root.dataset.referenceFormBound==='5')return;root.dataset.referenceFormBound='5';root.addEventListener('click',async(event)=>{const target=event.target as HTMLElement,run=target.closest<HTMLElement>('[data-switch-run]');if(run){event.preventDefault();event.stopImmediatePropagation();const input=root.querySelector<HTMLTextAreaElement>('#prompt-switch-input'),source=clean(input?.value??'');if(!source){input?.focus();return;}const ratio=root.querySelector<HTMLSelectElement>('[data-switch-ratio]')?.value??'4:5',strength=(root.querySelector<HTMLSelectElement>('[data-switch-strength]')?.value??'lock') as PromptStrength,keepIdentity=root.querySelector<HTMLInputElement>('[data-switch-identity]')?.checked??true,keepWardrobe=root.querySelector<HTMLInputElement>('[data-switch-wardrobe]')?.checked??false,addSafeguards=root.querySelector<HTMLSelectElement>('[data-switch-negative]')?.value==='strong';render(root,build(source,ratio,strength,keepIdentity,keepWardrobe,addSafeguards));root.querySelector<HTMLElement>('[data-switch-result]')?.scrollIntoView({behavior:'smooth',block:'nearest'});return;}const toolButton=target.closest<HTMLButtonElement>('[data-switch-tool]');if(toolButton){const tool=toolButton.dataset.switchTool as ReferenceTool;root.querySelectorAll<HTMLButtonElement>('[data-switch-tool]').forEach((button)=>{const active=button.dataset.switchTool===tool;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));});root.querySelectorAll<HTMLElement>('[data-switch-output]').forEach((output)=>output.classList.toggle('active',output.dataset.switchOutput===tool));return;}const copy=target.closest<HTMLButtonElement>('[data-switch-copy]');if(copy){const tool=copy.dataset.switchCopy as ReferenceTool,prompt=root.querySelector<HTMLElement>(`[data-switch-prompt="${tool}"]`)?.textContent??'';if(!prompt)return;await navigator.clipboard.writeText(prompt);const original=copy.textContent;copy.textContent='복사 완료';window.setTimeout(()=>{copy.textContent=original},1400);}},true);new MutationObserver(()=>decorate(root)).observe(root,{childList:true,subtree:true});}
function mount(){const root=document.getElementById(ROOT_ID) as HTMLElement|null;if(!root)return false;bind(root);return true;}
function start(){if(mount())return;const observer=new MutationObserver(()=>{if(!mount())return;observer.disconnect();});observer.observe(document.documentElement,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
