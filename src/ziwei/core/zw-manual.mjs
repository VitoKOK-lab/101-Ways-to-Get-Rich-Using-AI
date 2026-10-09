/**
 * 紫微斗數「手排命盤」步驟（初學者課程 /knowledge/ziwei/ 的排盤課用）。
 *
 * 這支程式照課程教的口訣一步一步算，每一步都留下「怎麼算出來的」過程，讓課程頁的「對答案」工具顯示。
 * 正確性：test/zw-manual.test.mjs 拿上千張生日跟網站排盤引擎（首頁同一套設定）逐顆星比對，口訣和引擎不一致就擋。
 * 純函式、沒有相依，瀏覽器與 Node 共用。
 *
 * 位置一律用地支索引：子 0、丑 1、寅 2 … 亥 11。
 * 時辰索引：子 0、丑 1 … 亥 11（晚子時 23:00 後，日期用隔天、時辰用子時，由呼叫端換好）。
 */

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const HOURS = [
  ['子', '23:00–01:00'], ['丑', '01:00–03:00'], ['寅', '03:00–05:00'], ['卯', '05:00–07:00'],
  ['辰', '07:00–09:00'], ['巳', '09:00–11:00'], ['午', '11:00–13:00'], ['未', '13:00–15:00'],
  ['申', '15:00–17:00'], ['酉', '17:00–19:00'], ['戌', '19:00–21:00'], ['亥', '21:00–23:00'],
];
/** 十二宮名，從命宮開始逆時針（地支往回數）依序排 */
export const PALACES = ['命宮', '兄弟宮', '夫妻宮', '子女宮', '財帛宮', '疾厄宮', '遷移宮', '交友宮', '官祿宮', '田宅宮', '福德宮', '父母宮'];

const mod = (n, m = 12) => ((n % m) + m) % m;
const B = name => BRANCHES.indexOf(name);
export const branchName = i => BRANCHES[mod(i)];
const isYang = stem => STEMS.indexOf(stem) % 2 === 0;

/* ── 第 0 步：閏月與晚子時 ── */
/** 閏月：前半個月（初一到十五）當本月，十六日起當下個月 */
export function effectiveMonth(lunarMonth, lunarDay, isLeap) {
  if (!isLeap || lunarDay <= 15) return { month: lunarMonth, note: isLeap ? `閏${lunarMonth}月${lunarDay}日在前半個月，當作 ${lunarMonth} 月` : '' };
  const m = lunarMonth === 12 ? 1 : lunarMonth + 1;
  return { month: m, note: `閏${lunarMonth}月${lunarDay}日在後半個月，當作 ${m} 月` };
}

/* ── 第 1 步：命宮、身宮 ── */
/** 寅宮起正月順數到生月；從生月那格起子時，逆數到生時是命宮，順數到生時是身宮 */
export function lifeAndBody(month, hour) {
  const monthPos = mod(B('寅') + month - 1);
  return { monthPos, life: mod(monthPos - hour), body: mod(monthPos + hour) };
}

/* ── 第 2 步：十二宮名 ── */
export function palaceNames(life) {
  const out = {};
  PALACES.forEach((name, k) => { out[mod(life - k)] = name; });
  return out;   /* 地支索引 → 宮名 */
}

/* ── 第 3 步：宮干（五虎遁）── */
const TIGER = { 甲: '丙', 己: '丙', 乙: '戊', 庚: '戊', 丙: '庚', 辛: '庚', 丁: '壬', 壬: '壬', 戊: '甲', 癸: '甲' };
/** 年干決定寅宮的天干，再從寅宮順著地支一格一格往下排 */
export function palaceStems(yearStem) {
  const start = STEMS.indexOf(TIGER[yearStem]);
  const out = {};
  for (let k = 0; k < 12; k++) out[mod(B('寅') + k)] = STEMS[(start + k) % 10];
  return { tigerStem: TIGER[yearStem], stems: out };
}

/* ── 第 4 步：五行局（命宮干支的納音，用加數口訣）── */
const STEM_NUM = { 甲: 1, 乙: 1, 丙: 2, 丁: 2, 戊: 3, 己: 3, 庚: 4, 辛: 4, 壬: 5, 癸: 5 };
const BRANCH_NUM = { 子: 1, 丑: 1, 午: 1, 未: 1, 寅: 2, 卯: 2, 申: 2, 酉: 2, 辰: 3, 巳: 3, 戌: 3, 亥: 3 };
const SUM_ELEMENT = { 1: ['木', 3], 2: ['金', 4], 3: ['水', 2], 4: ['火', 6], 5: ['土', 5] };
export function fiveElements(lifeStem, lifeBranch) {
  const s = STEM_NUM[lifeStem], b = BRANCH_NUM[lifeBranch];
  const raw = s + b, sum = raw > 5 ? raw - 5 : raw;
  const [element, ju] = SUM_ELEMENT[sum];
  return { stemNum: s, branchNum: b, raw, sum, element, ju, name: `${element}${['', '', '二', '三', '四', '五', '六'][ju]}局` };
}

/* ── 第 5 步：紫微星 ── */
/**
 * 生日數 ÷ 局數：找最小的「補數」x，讓（生日＋x）剛好被局數整除，商數 q。
 * 從寅宮算第 1 格，數到第 q 格；x 是單數就往回退 x 格，雙數（含 0）就往前進 x 格。
 */
export function ziweiPos(day, ju) {
  let x = 0;
  while ((day + x) % ju !== 0) x++;
  const q = (day + x) / ju;
  const base = mod(B('寅') + q - 1);
  const pos = x % 2 === 1 ? mod(base - x) : mod(base + x);
  return { x, q, base, odd: x % 2 === 1, pos };
}

/* ── 第 6、7 步：十四主星 ── */
const ZIWEI_GROUP = [['紫微', 0], ['天機', -1], ['太陽', -3], ['武曲', -4], ['天同', -5], ['廉貞', -8]];
const TIANFU_GROUP = [['天府', 0], ['太陰', 1], ['貪狼', 2], ['巨門', 3], ['天相', 4], ['天梁', 5], ['七殺', 6], ['破軍', 10]];
/** 天府和紫微以寅申為軸左右對稱：天府 ＝（4 − 紫微）的位置 */
export const tianfuPos = ziwei => mod(4 - ziwei);
export function majorStars(ziwei) {
  const fu = tianfuPos(ziwei);
  const out = {};
  for (const [name, off] of ZIWEI_GROUP) out[name] = mod(ziwei + off);
  for (const [name, off] of TIANFU_GROUP) out[name] = mod(fu + off);
  return out;   /* 星名 → 地支索引 */
}

/* ── 第 8 步：六吉星 ── */
const KUI_YUE = { 甲: ['丑', '未'], 戊: ['丑', '未'], 庚: ['丑', '未'], 乙: ['子', '申'], 己: ['子', '申'], 丙: ['亥', '酉'], 丁: ['亥', '酉'], 壬: ['卯', '巳'], 癸: ['卯', '巳'], 辛: ['午', '寅'] };
export function luckyStars(yearStem, month, hour) {
  const [kui, yue] = KUI_YUE[yearStem];
  return {
    左輔: mod(B('辰') + month - 1), 右弼: mod(B('戌') - (month - 1)),
    文昌: mod(B('戌') - hour), 文曲: mod(B('辰') + hour),
    天魁: B(kui), 天鉞: B(yue),
  };
}

/* ── 第 9 步：祿存、擎羊、陀羅、天馬、火星、鈴星、地空、地劫 ── */
const LUCUN = { 甲: '寅', 乙: '卯', 丙: '巳', 戊: '巳', 丁: '午', 己: '午', 庚: '申', 辛: '酉', 壬: '亥', 癸: '子' };
/** 年支三合一組：寅午戌、申子辰、巳酉丑、亥卯未 */
const TRINE = { 寅: 0, 午: 0, 戌: 0, 申: 1, 子: 1, 辰: 1, 巳: 2, 酉: 2, 丑: 2, 亥: 3, 卯: 3, 未: 3 };
const TIANMA = ['申', '寅', '亥', '巳'];
const FIRE_BELL = [['丑', '卯'], ['寅', '戌'], ['卯', '戌'], ['酉', '戌']];
export function toughStars(yearStem, yearBranch, hour) {
  const lu = B(LUCUN[yearStem]);
  const g = TRINE[yearBranch];
  const [fire, bell] = FIRE_BELL[g];
  return {
    祿存: lu, 擎羊: mod(lu + 1), 陀羅: mod(lu - 1), 天馬: B(TIANMA[g]),
    火星: mod(B(fire) + hour), 鈴星: mod(B(bell) + hour),
    地劫: mod(B('亥') + hour), 地空: mod(B('亥') - hour),
  };
}

/* ── 第 10 步：生年四化 ── */
export const MUTAGEN = {
  甲: ['廉貞', '破軍', '武曲', '太陽'], 乙: ['天機', '天梁', '紫微', '太陰'], 丙: ['天同', '天機', '文昌', '廉貞'],
  丁: ['太陰', '天同', '天機', '巨門'], 戊: ['貪狼', '太陰', '右弼', '天機'], 己: ['武曲', '貪狼', '天梁', '文曲'],
  庚: ['太陽', '武曲', '太陰', '天同'], 辛: ['巨門', '太陽', '文曲', '文昌'], 壬: ['天梁', '紫微', '左輔', '武曲'],
  癸: ['破軍', '巨門', '太陰', '貪狼'],
};
export const MUT_KEYS = ['祿', '權', '科', '忌'];
export function birthMutagens(yearStem) {
  return Object.fromEntries(MUTAGEN[yearStem].map((star, k) => [star, MUT_KEYS[k]]));   /* 星名 → 祿權科忌 */
}

/* ── 第 11 步：大限 ── */
/** 起運歲數＝局數；陽男陰女從命宮順行，陰男陽女逆行，每宮十年（虛歲） */
export function decades(life, ju, yearStem, gender) {
  const forward = isYang(yearStem) === (gender === '男');
  const out = {};
  for (let k = 0; k < 12; k++) out[mod(life + (forward ? k : -k))] = [ju + 10 * k, ju + 10 * k + 9];
  return { forward, ranges: out };
}

/* ── 流年：當年的地支那一格就是流年命宮 ── */
export function yearlyLife(year) {
  const branch = mod(year - 4);   /* 西元 4 年是甲子年 */
  return { stem: STEMS[mod(year - 4, 10)], branch, name: STEMS[mod(year - 4, 10)] + BRANCHES[branch] };
}

/**
 * 一次排完整張盤（照課程順序），回傳每一步的結果與過程。
 * @param {{ yearStem, yearBranch, lunarMonth, lunarDay, isLeap, hour, gender }} input  hour：子 0 … 亥 11
 */
export function manualChart(input) {
  const { yearStem, yearBranch, lunarMonth, lunarDay, isLeap, hour, gender } = input;
  const m = effectiveMonth(lunarMonth, lunarDay, isLeap);
  const lb = lifeAndBody(m.month, hour);
  const names = palaceNames(lb.life);
  const ps = palaceStems(yearStem);
  const fe = fiveElements(ps.stems[lb.life], BRANCHES[lb.life]);
  const zw = ziweiPos(lunarDay, fe.ju);
  const majors = majorStars(zw.pos);
  const lucky = luckyStars(yearStem, m.month, hour);
  const tough = toughStars(yearStem, yearBranch, hour);
  const muts = birthMutagens(yearStem);
  const dec = decades(lb.life, fe.ju, yearStem, gender);
  return { input, month: m, lifeBody: lb, names, stems: ps, five: fe, ziwei: zw, majors, lucky, tough, mutagens: muts, decades: dec };
}
