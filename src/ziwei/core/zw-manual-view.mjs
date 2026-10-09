/**
 * 手排命盤的「畫面」：逐步填盤的 SVG 與每一步的白話說明。
 * 課程頁（建置時，用示範人物小晴）與「對答案」工具（瀏覽器，用學員自己的生日）共用同一套，畫面和說法永遠一致。
 * 說明文字是給客人看的：照 docs/V2-AZI-VOICE.md 口吻；test/zw-manual-view.test.mjs 會檢查負面詞、簡體字。
 */
import { BRANCHES, HOURS, PALACES, MUT_KEYS, branchName } from './zw-manual.mjs';

/** 課程的排盤步驟順序；每一課對應一個步驟，盤面會填到那一步為止 */
export const STEPS = ['grid', 'lunar', 'life', 'names', 'stems', 'five', 'ziwei', 'ziweiGroup', 'tianfuGroup', 'lucky', 'tough', 'mutagen', 'decades', 'full', 'read', 'empty', 'topics', 'decadeNow', 'yearly'];
const reached = (upTo, step) => STEPS.indexOf(upTo) >= STEPS.indexOf(step);

const GRID = { 巳: [0, 0], 午: [1, 0], 未: [2, 0], 申: [3, 0], 辰: [0, 1], 酉: [3, 1], 卯: [0, 2], 戌: [3, 2], 寅: [0, 3], 丑: [1, 3], 子: [2, 3], 亥: [3, 3] };
const ZIWEI_GROUP = ['紫微', '天機', '太陽', '武曲', '天同', '廉貞'];
const TIANFU_GROUP = ['天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍'];
const LUCKY = ['左輔', '右弼', '文昌', '文曲', '天魁', '天鉞'];
const TOUGH = ['祿存', '天馬', '擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'];
const esc = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mod = n => ((n % 12) + 12) % 12;

/** 這一步新填進去的格子（畫面上加深） */
function changedCells(m, step) {
  const pos = names => names.map(n => ({ ...m.majors, ...m.lucky, ...m.tough })[n]);
  switch (step) {
    case 'life': return [m.lifeBody.life, m.lifeBody.body, m.lifeBody.monthPos];
    case 'five': case 'read': case 'empty': case 'topics': return [m.lifeBody.life];
    case 'ziwei': return [m.ziwei.pos];
    case 'ziweiGroup': return pos(ZIWEI_GROUP);
    case 'tianfuGroup': return pos(TIANFU_GROUP);
    case 'lucky': return pos(LUCKY);
    case 'tough': return pos(TOUGH);
    case 'mutagen': return Object.keys(m.mutagens).map(n => ({ ...m.majors, ...m.lucky })[n]).filter(v => v !== undefined);
    default: return [];
  }
}

/**
 * 逐步填盤 SVG。
 * @param m      zw-manual 的 manualChart 結果
 * @param upTo   填到哪一步（STEPS 之一）
 * @param opts   { info:{ lunarText, yearGZ, hourName }, brightness:{星名:'廟'}, focus:地支索引[], title }
 */
export function stepGridSvg(m, upTo, opts = {}) {
  const W = 640, C = W / 4;
  const changed = new Set(opts.focus || changedCells(m, upTo));
  const starsAt = i => {
    const list = [];
    const add = (group, cls) => group.forEach(n => {
      const p = { ...m.majors, ...m.lucky, ...m.tough }[n];
      if (p === i) list.push({ n, cls, mut: reached(upTo, 'mutagen') ? m.mutagens[n] : '', b: reached(upTo, 'mutagen') && opts.brightness ? opts.brightness[n] || '' : '' });
    });
    if (reached(upTo, 'ziwei')) add(reached(upTo, 'ziweiGroup') ? ZIWEI_GROUP : ['紫微'], 'zm-major');
    if (reached(upTo, 'tianfuGroup')) add(TIANFU_GROUP, 'zm-major');
    if (reached(upTo, 'lucky')) add(LUCKY, 'zm-lucky');
    if (reached(upTo, 'tough')) add(TOUGH, 'zm-tough');
    return list;
  };
  const cells = BRANCHES.map((br, i) => {
    const [c, r] = GRID[br];
    const x = c * C, y = r * C;
    const isLife = reached(upTo, 'life') && i === m.lifeBody.life;
    const isBody = reached(upTo, 'life') && i === m.lifeBody.body;
    const stars = starsAt(i);
    const majors = stars.filter(s => s.cls === 'zm-major');
    const minors = stars.filter(s => s.cls !== 'zm-major');
    const majorLine = majors.map(s => `${s.n}${s.b}${s.mut ? `·${s.mut}` : ''}`).join(' ');
    const minorLines = [];
    for (let k = 0; k < minors.length; k += 3) minorLines.push(minors.slice(k, k + 3));
    const name = reached(upTo, 'names') ? m.names[i] : isLife ? '命宮' : '';
    const range = reached(upTo, 'decades') ? m.decades.ranges[i] : null;
    return `<g class="zm-cell${changed.has(i) ? ' is-new' : ''}${isLife ? ' is-life' : ''}"><rect x="${x + 1}" y="${y + 1}" width="${C - 2}" height="${C - 2}" rx="6"/>`
      + (majorLine ? `<text x="${x + 10}" y="${y + 24}" class="zm-major">${esc(majorLine)}</text>` : '')
      + minorLines.map((row, k) => `<text x="${x + 10}" y="${y + 46 + k * 17}" class="zm-minor">${row.map(s => `<tspan class="${s.cls}">${esc(s.n)}${s.mut ? `·${esc(s.mut)}` : ''}</tspan>`).join(' ')}</text>`).join('')
      + (name ? `<text x="${x + 10}" y="${y + C - 12}" class="zm-name">${esc(name)}${isBody ? '·身' : ''}</text>` : isBody ? `<text x="${x + 10}" y="${y + C - 12}" class="zm-name">身宮</text>` : '')
      + `<text x="${x + C - 10}" y="${y + C - 12}" class="zm-branch" text-anchor="end">${reached(upTo, 'stems') ? esc(m.stems.stems[i]) : ''}${esc(br)}</text>`
      + (range ? `<text x="${x + C - 10}" y="${y + C - 30}" class="zm-meta" text-anchor="end">${range[0]}–${range[1]}</text>` : '')
      + (upTo === 'life' && i === m.lifeBody.monthPos ? `<text x="${x + C - 10}" y="${y + 24}" class="zm-meta" text-anchor="end">生月</text>` : '')
      + '</g>';
  }).join('');
  const info = opts.info || {};
  const lines = [info.lunarText, [info.yearGZ && `${info.yearGZ}年`, info.hourName].filter(Boolean).join('　'), reached(upTo, 'five') ? m.five.name : ''].filter(Boolean);
  const center = `<rect x="${C + 1}" y="${C + 1}" width="${C * 2 - 2}" height="${C * 2 - 2}" rx="8" class="zm-center"/>`
    + `<text x="${W / 2}" y="${W / 2 - 30}" text-anchor="middle" class="zm-title">${esc(opts.title || '我的命盤')}</text>`
    + lines.map((t, k) => `<text x="${W / 2}" y="${W / 2 + 2 + k * 24}" text-anchor="middle" class="zm-meta">${esc(t)}</text>`).join('');
  const desc = `排到「${stepLabel(upTo)}」這一步的命盤。`;
  return `<svg class="zchart zmanual" viewBox="0 0 ${W} ${W}" role="img" aria-label="${esc(desc)}" xmlns="http://www.w3.org/2000/svg">${center}${cells}</svg>`;
}

export const stepLabel = step => ({
  grid: '畫好空白命盤', lunar: '整理生日資料', life: '安命宮、身宮', names: '排十二宮名', stems: '排宮干', five: '定五行局',
  ziwei: '安紫微星', ziweiGroup: '安紫微星系', tianfuGroup: '安天府星系', lucky: '安六吉星', tough: '安祿存、天馬與六煞',
  mutagen: '標生年四化與亮度', decades: '排大限', full: '完整命盤', read: '讀命宮與三方四正', empty: '空宮借星', topics: '感情、工作、錢',
  decadeNow: '找到現在的大限', yearly: '找到流年命宮',
})[step] || step;

const n2 = n => ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'][n] || String(n);
/** 農曆月份的說法：一月叫正月 */
export const monthName = n => (n === 1 ? '正月' : `${n2(n)}月`);
const at = (m, i) => `${m.stems.stems[i]}${BRANCHES[i]}`;
const placeOf = (m, star) => ({ ...m.majors, ...m.lucky, ...m.tough })[star];

/**
 * 每一步的說明（純文字段落陣列）。
 * @param ctx { info:{ lunarText, yearGZ, hourName, lateZi, leapNote, age, year }, engine:{ ... 只有讀盤與流年步驟會用到 } }
 */
export function explainStep(step, m, ctx = {}) {
  const i = ctx.info || {};
  const L = m.lifeBody;
  switch (step) {
    case 'grid':
      return ['命盤是 4×4 的十六格，外圈十二格各配一個地支，中間四格合起來寫基本資料。左下角是寅，沿著左邊往上是卯、辰、巳，再沿著上排往右是午、未、申，右邊往下是酉、戌、亥，下排往左回到子、丑。這個位置每一張盤都一樣。'];
    case 'lunar':
      return [
        `你的農曆生日是${i.lunarText}，出生年的干支是${i.yearGZ}，時辰是${i.hourName}。`,
        i.lateZi ? '你是晚子時（23:00 之後）出生：年和月照出生當天，日數用隔天的農曆日數，時辰算子時。' : '',
        m.month.note ? `你出生在閏月：${m.month.note}。` : '',
        `接下來排盤要用的四個數字：年干「${m.input.yearStem}」、年支「${m.input.yearBranch}」、農曆月「${m.month.month}」、農曆日「${m.input.lunarDay}」，加上時辰「${HOURS[m.input.hour][0]}」。`,
      ].filter(Boolean);
    case 'life':
      return [
        `先找生月：從寅宮當正月，順著數到${monthName(m.month.month)}，停在${branchName(L.monthPos)}宮。`,
        `再從${branchName(L.monthPos)}宮當子時，往回（逆時針）數到${HOURS[m.input.hour][0]}時，停在${branchName(L.life)}宮，這裡就是命宮。`,
        `同樣從${branchName(L.monthPos)}宮當子時，往前（順時針）數到${HOURS[m.input.hour][0]}時，停在${branchName(L.body)}宮，這裡是身宮。`,
      ];
    case 'names':
      return [`從命宮（${branchName(L.life)}）開始逆時針，依序填上：${PALACES.map((p, k) => `${p}（${branchName(L.life - k)}）`).join('、')}。`];
    case 'stems':
      return [
        `年干是${m.input.yearStem}，用五虎遁口訣，寅宮的天干是${m.stems.tigerStem}。`,
        `從寅宮的${m.stems.tigerStem}開始，順著卯、辰、巳一路排下去：${BRANCHES.map((b, k) => BRANCHES[(k + 2) % 12]).map(b => `${m.stems.stems[BRANCHES.indexOf(b)]}${b}`).join('、')}。`,
        `所以你的命宮是${at(m, L.life)}。`,
      ];
    case 'five':
      return [
        `命宮是${at(m, L.life)}。天干「${m.stems.stems[L.life]}」算 ${m.five.stemNum}，地支「${BRANCHES[L.life]}」算 ${m.five.branchNum}，加起來是 ${m.five.raw}${m.five.raw > 5 ? `，超過 5 要減 5，得到 ${m.five.sum}` : ''}。`,
        `${m.five.sum} 對應「${m.five.element}」，所以是${m.five.name}，局數是 ${m.five.ju}。`,
      ];
    case 'ziwei': {
      const z = m.ziwei;
      return [
        `農曆日是 ${m.input.lunarDay}，局數是 ${m.five.ju}。${z.x === 0 ? `${m.input.lunarDay} 剛好可以被 ${m.five.ju} 整除` : `${m.input.lunarDay} 要再加 ${z.x} 才能被 ${m.five.ju} 整除（補數是 ${z.x}）`}，商數是 ${z.q}。`,
        `從寅宮算第 1 格，數到第 ${z.q} 格，是${branchName(z.base)}宮。`,
        z.x === 0 ? `補數是 0，不用移動，紫微星就在${branchName(z.pos)}宮。` : `補數 ${z.x} 是${z.odd ? '單數，往回退' : '雙數，往前進'} ${z.x} 格，紫微星落在${branchName(z.pos)}宮。`,
      ];
    }
    case 'ziweiGroup':
      return [`從紫微（${branchName(m.ziwei.pos)}）開始逆時針：下一格天機（${branchName(placeOf(m, '天機'))}），空一格放太陽（${branchName(placeOf(m, '太陽'))}），接著武曲（${branchName(placeOf(m, '武曲'))}）、天同（${branchName(placeOf(m, '天同'))}），再空兩格放廉貞（${branchName(placeOf(m, '廉貞'))}）。`];
    case 'tianfuGroup':
      return [
        `天府和紫微隔著寅申這條線左右對稱：紫微在${branchName(m.ziwei.pos)}，天府就在${branchName(placeOf(m, '天府'))}。`,
        `從天府開始順時針：太陰（${branchName(placeOf(m, '太陰'))}）、貪狼（${branchName(placeOf(m, '貪狼'))}）、巨門（${branchName(placeOf(m, '巨門'))}）、天相（${branchName(placeOf(m, '天相'))}）、天梁（${branchName(placeOf(m, '天梁'))}）、七殺（${branchName(placeOf(m, '七殺'))}），再空三格放破軍（${branchName(placeOf(m, '破軍'))}）。`,
      ];
    case 'lucky':
      return [
        `看生月（${monthName(m.month.month)}）：左輔從辰宮起正月順數，落在${branchName(m.lucky.左輔)}；右弼從戌宮起正月逆數，落在${branchName(m.lucky.右弼)}。`,
        `看生時（${HOURS[m.input.hour][0]}時）：文昌從戌宮起子時逆數，落在${branchName(m.lucky.文昌)}；文曲從辰宮起子時順數，落在${branchName(m.lucky.文曲)}。`,
        `看年干（${m.input.yearStem}）：天魁在${branchName(m.lucky.天魁)}，天鉞在${branchName(m.lucky.天鉞)}。`,
      ];
    case 'tough':
      return [
        `看年干（${m.input.yearStem}）：祿存在${branchName(m.tough.祿存)}，擎羊在祿存的下一格（${branchName(m.tough.擎羊)}），陀羅在祿存的上一格（${branchName(m.tough.陀羅)}）。`,
        `看年支（${m.input.yearBranch}）：天馬在${branchName(m.tough.天馬)}；火星從${branchName(m.tough.火星 - m.input.hour)}起子時、鈴星從${branchName(m.tough.鈴星 - m.input.hour)}起子時，都順數到${HOURS[m.input.hour][0]}時，火星落在${branchName(m.tough.火星)}，鈴星落在${branchName(m.tough.鈴星)}。`,
        `看生時：地劫從亥宮起子時順數，落在${branchName(m.tough.地劫)}；地空從亥宮起子時逆數，落在${branchName(m.tough.地空)}。`,
      ];
    case 'mutagen': {
      const list = Object.entries(m.mutagens).map(([star, k]) => `${star}化${k}`);
      return [
        `年干是${m.input.yearStem}，生年四化是：${list.join('、')}。`,
        `把這四個字標在那四顆星旁邊：${Object.entries(m.mutagens).map(([star, k]) => `${star}在${branchName(placeOf(m, star))}宮，標「${k}」`).join('；')}。`,
      ];
    }
    case 'decades': {
      const yang = '甲丙戊庚壬'.includes(m.input.yearStem);
      const g = m.input.gender;
      return [
        `年干${m.input.yearStem}是${yang ? '陽' : '陰'}干，你是${yang ? '陽' : '陰'}${g}，所以大限${m.decades.forward ? '從命宮順時針' : '從命宮逆時針'}走。`,
        `起運歲數等於局數 ${m.five.ju}：命宮管 ${m.decades.ranges[L.life][0]}–${m.decades.ranges[L.life][1]} 歲，下一格管 ${m.five.ju + 10}–${m.five.ju + 19} 歲，每格十年，都是虛歲。`,
      ];
    }
    case 'full':
      return ['十四主星、六吉星、祿存天馬、六煞星、生年四化、大限都排好了，這就是一張可以開始讀的完整命盤。跟首頁排出來的盤對照，位置應該完全一樣。'];
    case 'read': case 'empty': case 'topics': {
      const tri = [L.life, mod(L.life + 6), mod(L.life + 4), mod(L.life + 8)];
      const majorsIn = idx => Object.entries(m.majors).filter(([, p]) => p === idx).map(([n]) => n);
      const lifeMajors = majorsIn(L.life);
      return [
        lifeMajors.length ? `你的命宮在${at(m, L.life)}，主星是${lifeMajors.join('、')}。` : `你的命宮在${at(m, L.life)}，沒有主星（空宮），要借對面遷移宮（${branchName(L.life + 6)}）的主星${majorsIn(mod(L.life + 6)).join('、') || ''}來看。`,
        `三方四正是：命宮（${branchName(tri[0])}）、遷移宮（${branchName(tri[1])}）、${m.names[tri[2]]}（${branchName(tri[2])}）、${m.names[tri[3]]}（${branchName(tri[3])}）。這四格一起看，才是命宮的完整樣貌。`,
      ];
    }
    case 'decadeNow': {
      if (!i.age) return ['輸入生日後，這裡會算出你今年的虛歲和正在走的大限。'];
      const idx = Object.entries(m.decades.ranges).find(([, [a, b]]) => i.age >= a && i.age <= b);
      if (!idx) return [`你今年虛歲 ${i.age}，還沒有進入第一個大限（從 ${m.five.ju} 歲開始）。`];
      const p = +idx[0];
      return [`你今年虛歲 ${i.age}，落在 ${idx[1][0]}–${idx[1][1]} 歲這個大限，大限命宮在${branchName(p)}宮，也就是本命的${m.names[p]}。這十年，${m.names[p]}代表的事會是你的人生主場。`];
    }
    case 'yearly': {
      const y = i.year || new Date().getFullYear();
      const gz = i.yearlyGZ || '';
      const p = i.yearlyBranch;
      if (p === undefined) return ['輸入生日後，這裡會找出今年和明年的流年命宮。'];
      return [`${y} 年是${gz}年，流年命宮就在${BRANCHES[p]}宮，也就是你本命的${m.names[p]}。這一年，${m.names[p]}代表的事最有動靜。`];
    }
    default: return [];
  }
}

export { MUT_KEYS };
