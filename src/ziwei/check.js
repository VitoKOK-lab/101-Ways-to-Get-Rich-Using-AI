/**
 * 紫微斗數排盤課程的「對答案」工具（/knowledge/ziwei/lesson-*）。
 * 學員輸入自己的生日 → 在瀏覽器裡用網站排盤引擎（App 同一套設定）算出正確答案，
 * 再用課程教的口訣（zw-manual.mjs）一步一步算給你看，排到這一課為止的命盤也畫出來。
 * 生日只在這台裝置上計算、不會送出；記在 localStorage 只是讓下一課不用重填（讀寫失敗也照常運作）。
 */
import { manualChart, BRANCHES, HOURS, STEMS } from './core/zw-manual.mjs';
import { stepGridSvg, explainStep, stepLabel } from './core/zw-manual-view.mjs';

const KEY = 'zw-course-birth';
const esc = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { return null; } };
const save = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (_) { /* 私密視窗或關閉儲存時照常運作 */ } };

let enginePromise = null;
function engine(src) {
  if (window.ZWCore && window.ZWCore.astro) return Promise.resolve(window.ZWCore.astro);
  if (!enginePromise) enginePromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = () => (window.ZWCore && window.ZWCore.astro ? resolve(window.ZWCore.astro) : reject(new Error('engine')));
    s.onerror = () => { enginePromise = null; reject(new Error('engine')); };
    document.head.appendChild(s);
  });
  return enginePromise;
}

const toTW = s => String(s).replace(/腊/g, '臘').replace(/闰/g, '閏');

/** 依 App 的設定排盤，整理成手排口訣要用的輸入 */
function compute(astro, b) {
  astro.config({ algorithm: 'zhongzhou' });
  const ds = `${b.y}-${b.m}-${b.d}`;
  const a = b.cal === 'lunar' ? astro.byLunar(ds, b.t, b.g, !!b.leap, true, 'zh-TW') : astro.bySolar(ds, b.t, b.g, true, 'zh-TW');
  const lunar = { ...a.rawDates.lunarDate };
  const lateZi = b.t === 12;
  if (lateZi) {   /* 晚子時：年、月照當天，日數用隔天 */
    const [y, mo, d] = a.solarDate.split('-').map(Number);
    const next = new Date(Date.UTC(y, mo - 1, d + 1));
    lunar.lunarDay = astro.bySolar(`${next.getUTCFullYear()}-${next.getUTCMonth() + 1}-${next.getUTCDate()}`, 0, b.g, true, 'zh-TW').rawDates.lunarDate.lunarDay;
  }
  const [yearStem, yearBranch] = a.rawDates.chineseDate.yearly;
  const m = manualChart({ yearStem, yearBranch, lunarMonth: lunar.lunarMonth, lunarDay: lunar.lunarDay, isLeap: lunar.isLeap, hour: b.t % 12, gender: b.g });
  const brightness = {};
  for (const p of a.palaces) for (const s of [...p.majorStars, ...p.minorStars]) if (s.brightness) brightness[s.name] = s.brightness;
  /* 口訣和引擎互相核對：對不上就照實說，以 App 排盤為準 */
  const mismatch = a.palaces.find(p => p.name === '命宮').earthlyBranch !== BRANCHES[m.lifeBody.life]
    || a.fiveElementsClass !== m.five.name;
  /* 虛歲與流年都以農曆正月初一換年（引擎的流年資料），國曆 1 月到春節前不會算成下一年 */
  const h = a.horoscope(new Date());
  const age = h.age.nominalAge;
  const yearlyBranch = BRANCHES.indexOf(h.yearly.earthlyBranch);
  const yearlyGZ = h.yearly.heavenlyStem + h.yearly.earthlyBranch;
  const gy = new Date().getFullYear();
  const year = (STEMS[((gy - 4) % 10 + 10) % 10] + BRANCHES[((gy - 4) % 12 + 12) % 12]) === yearlyGZ ? gy : gy - 1;
  const info = {
    lunarText: toTW(a.lunarDate), yearGZ: yearStem + yearBranch, hourName: `${HOURS[b.t % 12][0]}時${lateZi ? '（晚子時）' : ''}`,
    lateZi, age, year, yearlyGZ, yearlyBranch,
  };
  return { m, info, brightness, mismatch };
}

function render(box, b, astro) {
  const step = box.dataset.step;
  const out = box.querySelector('.zw-check-out');
  try {
    const { m, info, brightness, mismatch } = compute(astro, b);
    const lines = explainStep(step, m, { info });
    out.innerHTML = `<h3>你的答案：${esc(stepLabel(step))}</h3>`
      + lines.map(t => `<p>${esc(t)}</p>`).join('')
      + (mismatch ? '<p class="zw-check-warn">這張盤有比較特殊的設定，請以紫微宇宙 App 排出來的命盤為準。</p>' : '')
      + `<figure class="zw-chart"><div class="zw-chart-scroll" tabindex="0" aria-label="你的命盤，可左右滑動">${stepGridSvg(m, step, { info, brightness, title: '你的命盤' })}</div><p class="zw-chart-hint">← 左右滑動看完整命盤 →</p><figcaption>排到這一課為止的命盤。藍綠色是這一步新填上去的格子。</figcaption></figure>`;
    out.hidden = false;
  } catch (_) {
    out.innerHTML = '<p class="zw-check-warn">這組生日排不出來，請確認日期是否正確（例如農曆小月沒有三十日）。</p>';
    out.hidden = false;
  }
}

export function mount(box) {
  const src = box.dataset.engine;
  const opts = (n, f) => Array.from({ length: n }, (_, k) => f(k)).join('');
  box.innerHTML = `<form class="zw-check-form">
<fieldset><legend>曆法</legend><label><input type="radio" name="cal" value="solar" checked> 國曆</label><label><input type="radio" name="cal" value="lunar"> 農曆</label><label class="zw-leap"><input type="checkbox" name="leap"> 閏月</label></fieldset>
<label>年<select name="y">${opts(111, k => `<option>${1930 + k}</option>`)}</select></label>
<label>月<select name="m">${opts(12, k => `<option value="${k + 1}">${k + 1}</option>`)}</select></label>
<label>日<select name="d">${opts(31, k => `<option value="${k + 1}">${k + 1}</option>`)}</select></label>
<label>時辰<select name="t">${opts(12, k => `<option value="${k}">${HOURS[k][0]}時 ${k === 0 ? '00:00–01:00（早子）' : HOURS[k][1]}</option>`)}<option value="12">子時 23:00–24:00（晚子）</option></select></label>
<fieldset><legend>性別</legend><label><input type="radio" name="g" value="女" checked> 女</label><label><input type="radio" name="g" value="男"> 男</label></fieldset>
<button type="submit">對答案</button>
<p class="zw-check-note">生日只在你的手機或電腦裡計算，不會送出。</p>
</form><div class="zw-check-out" hidden aria-live="polite"></div>`;
  const form = box.querySelector('form');
  const saved = load() || { cal: 'solar', y: 1998, m: 2, d: 10, t: 2, g: '女', leap: false };
  form.y.value = saved.y; form.m.value = saved.m; form.d.value = saved.d; form.t.value = saved.t;
  form.querySelector(`[name=cal][value=${saved.cal === 'lunar' ? 'lunar' : 'solar'}]`).checked = true;
  form.querySelector(`[name=g][value=${saved.g === '男' ? '男' : '女'}]`).checked = true;
  form.leap.checked = !!saved.leap;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const b = { cal: form.cal.value, y: +form.y.value, m: +form.m.value, d: +form.d.value, t: +form.t.value, g: form.g.value, leap: form.leap.checked };
    save(b);
    const btn = form.querySelector('button'); btn.disabled = true; btn.textContent = '計算中…';
    try { render(box, b, await engine(src)); }
    catch (_) { box.querySelector('.zw-check-out').innerHTML = '<p class="zw-check-warn">排盤引擎沒有載入成功，請重新整理頁面再試一次。</p>'; box.querySelector('.zw-check-out').hidden = false; }
    btn.disabled = false; btn.textContent = '對答案';
  });
  if (load()) form.requestSubmit();   /* 上一課填過的生日，直接帶出這一課的答案 */
}
