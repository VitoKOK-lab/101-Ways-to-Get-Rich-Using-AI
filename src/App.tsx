import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Menu,
  Play,
  Search,
  X,
} from 'lucide-react'
import { categories, courses, ziweiCourse, type Course, type LessonBlock } from './data'

type Route =
  | { page: 'home' }
  | { page: 'explore' }
  | { page: 'library' }
  | { page: 'course'; slug: string }
  | { page: 'lesson'; slug: string; index: number }
  | { page: 'not-found' }

type CourseState = { started: boolean; completed: number[]; notes: Record<number, string> }
type LearningState = Record<string, CourseState>

function readRoute(): Route {
  const path = window.location.hash.replace(/^#/, '') || '/'
  if (path === '/') return { page: 'home' }
  if (path === '/explore') return { page: 'explore' }
  if (path === '/my-learning') return { page: 'library' }
  const lesson = path.match(/^\/learn\/([^/]+)\/(\d+)$/)
  if (lesson) return { page: 'lesson', slug: lesson[1], index: Number(lesson[2]) }
  const course = path.match(/^\/courses\/([^/]+)$/)
  if (course) return { page: 'course', slug: course[1] }
  return { page: 'not-found' }
}

function readLearning(): LearningState {
  try {
    const value = JSON.parse(localStorage.getItem('luxkey-learning-v1') || '{}') as LearningState
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

function courseHref(course: Course) { return `#/courses/${course.slug}` }
function lessonHref(course: Course, index: number) { return `#/learn/${course.slug}/${index}` }
function progressFor(course: Course, state?: CourseState) {
  return Math.round(((state?.completed.filter((index) => index >= 0 && index < course.lessons.length).length || 0) / course.lessons.length) * 100)
}

function Header({ route }: { route: Route }) {
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [route])
  return (
    <>
      <div className="topline"><span>LEARN. APPLY. MOVE.</span><span>學會，然後真的去做。</span></div>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#/" aria-label="LUXKEY 首頁">
            <span className="lx-logo">LUXKEY</span><span className="brand-sub">ACADEMY</span>
          </a>
          <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="主選單">
            <a href="#/explore" className={route.page === 'explore' ? 'active' : ''}>探索課程</a>
            <a href="#/my-learning" className={route.page === 'library' || route.page === 'lesson' ? 'active' : ''}>我的學習</a>
            <a className="nav-cta" href="#/explore">開始學習 <ArrowUpRight size={16} strokeWidth={2} /></a>
          </nav>
          <button className="menu-toggle" type="button" aria-label={open ? '關閉選單' : '開啟選單'} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>
    </>
  )
}

function Footer() {
  return <footer className="site-footer"><div className="container footer-grid">
    <div><span className="lx-logo footer-logo">LUXKEY</span><p>把下一步，學成真的。</p></div>
    <div className="footer-links"><a href="#/explore">探索課程</a><a href="#/my-learning">我的學習</a><a href="#/">回到首頁</a></div>
    <span className="footer-note">LUXKEY ACADEMY · 示範平台</span>
  </div></footer>
}

function Cover({ course, large = false }: { course: Course; large?: boolean }) {
  return <div className={`course-cover cover-${course.theme} cover-${course.slug} ${large ? 'cover-large' : ''}`} aria-hidden="true">
    <span className="cover-top">LUXKEY / FIELD CLASS <span>{course.number}</span></span>
    <div className="cover-rule" />
    <span className="cover-word">{course.coverWord.split(' / ').map((part, index) => <span key={part}>{part}{index === 0 && <br />}</span>)}</span>
    <div className="cover-bottom"><span>{course.category.toUpperCase()}</span><ArrowUpRight size={large ? 29 : 22} strokeWidth={1.7} /></div>
  </div>
}

function CourseCard({ course, state }: { course: Course; state?: CourseState }) {
  const percent = progressFor(course, state)
  return <a className="course-card" href={courseHref(course)}>
    <Cover course={course} />
    <div className="course-card-body">
      <div className="card-meta"><span>{course.category} / {course.level}</span><span>{course.duration}</span></div>
      <h3>{course.title}</h3><p>{course.subtitle}</p>
      <div className="card-action"><span>{state?.started ? `${percent}% 已完成` : '查看課程'}</span><ArrowUpRight size={18} /></div>
    </div>
  </a>
}

function Home({ learning }: { learning: LearningState }) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const recommended = courses.find((course) => course.slug === selectedGoal)
  const goals = [
    { slug: 'ai-workflow', label: '把時間從重複工作拿回來', tag: 'AI 實作' },
    { slug: 'market-validation', label: '讓自己的想法被市場驗證', tag: '創業' },
    { slug: 'brand-story', label: '說清楚品牌的獨特價值', tag: '品牌' },
    { slug: 'growth-experiments', label: '找到真正有效的增長方式', tag: '行銷' },
    { slug: 'ziwei-foundations', label: '從命盤認識自己與人生節奏', tag: '自我探索' },
  ]
  return <main>
    <section className="hero-section"><div className="container hero-grid">
      <div className="hero-copy">
        <div className="section-kicker"><span className="kicker-line" /> LUXKEY ACADEMY · LEARN BY DOING</div>
        <h1>把下一步，<br /><span>學成真的。</span></h1>
        <p className="hero-intro">從工作技能到自我探索，從想法到行動。每堂課都帶你做出一件看得見的事。</p>
        <div className="hero-actions"><button type="button" className="btn btn-primary" onClick={() => document.getElementById('find-path')?.scrollIntoView({ behavior: 'smooth' })}>找到適合我的課 <ArrowUpRight size={19} /></button><a className="text-link" href="#/explore">探索所有課程 <ArrowRight size={18} /></a></div>
        <div className="hero-bottom"><span>01 / 05</span><div className="hairline" /><span>LEARN BY DOING</span></div>
      </div>
      <div className="hero-image-caption"><span>THE NEXT CHAPTER / 2026</span><span>IDEA → ACTION</span></div>
    </div></section>

    <section className="principles"><div className="container principles-grid">
      <span className="principles-label">為什麼在這裡學？</span>
      <p>知識，<em>要能用。</em></p>
      <span className="principles-caption">短課節奏 · 實作練習 · 自己掌握進度</span>
    </div></section>

    <section className="spotlight-section"><div className="container spotlight-grid">
      <a className="spotlight-image" href={courseHref(ziweiCourse)} aria-label="查看紫微斗數入門課程"><span>NEW CLASS / 05</span><strong>STAR<br />MAP.</strong><span>20 LESSONS · ZIWEI UNIVERSE</span></a>
      <div className="spotlight-copy"><div className="section-kicker">本月選讀 / 紫微宇宙</div><h2>從一張命盤，<br /><span>讀懂自己的節奏。</span></h2><p>20 堂紫微斗數入門課，從出生資料、手排命盤，一步步走到解讀與規劃。每堂都有原站影片、課文和實作練習。</p><div className="spotlight-facts"><span>20 堂完整課程</span><span>4 個學習階段</span><span>免費開始</span></div><a className="btn btn-primary" href={courseHref(ziweiCourse)}>查看紫微入門課 <ArrowUpRight size={19} /></a></div>
    </div></section>

    <section className="path-section" id="find-path"><div className="container path-grid">
      <div className="path-intro"><div className="section-kicker">FIND YOUR NEXT STEP / 01</div><h2>現在，<br /><span>你想改變什麼？</span></h2><p>從眼前最想完成的事開始。我們會推薦一門可以立刻動手的課。</p><span className="path-small">選一個目標 · 即時顯示推薦課程</span></div>
      <div className="path-panel"><div className="path-panel-top"><span>CHOOSE YOUR DIRECTION</span><span>01 / 01</span></div><div className="path-options" role="group" aria-label="選擇學習目標">{goals.map((goal, index) => <button type="button" key={goal.slug} className={selectedGoal === goal.slug ? 'selected' : ''} aria-pressed={selectedGoal === goal.slug} onClick={() => setSelectedGoal(goal.slug)}><span className="path-option-number">{String(index + 1).padStart(2, '0')}</span><span>{goal.label}<small>{goal.tag}</small></span><ArrowUpRight size={20} /></button>)}</div>{recommended ? <div className="path-result" aria-live="polite"><span>你的推薦課程</span><strong>{recommended.title}</strong><p>{recommended.subtitle}</p><a href={courseHref(recommended)}>查看課程內容 <ArrowRight size={18} /></a></div> : <div className="path-prompt">選擇一個方向，看見你的第一步。<ArrowRight size={18} /></div>}</div>
    </div></section>

    <section className="section courses-section"><div className="container">
      <div className="section-heading"><div><div className="section-kicker">01 / 精選課程</div><h2>從一門課，<br />打開下一步。</h2></div><a href="#/explore" className="text-link">探索全部課程 <ArrowUpRight size={18} /></a></div>
      <div className="course-grid">{courses.slice(0, 3).map((course) => <CourseCard key={course.slug} course={course} state={learning[course.slug]} />)}</div>
    </div></section>

    <section className="method-section" id="how"><div className="container method-grid">
      <div className="method-intro"><div className="section-kicker">02 / 學習方式</div><h2>少一點旁觀。<br /><span>多一點動手。</span></h2><p>你不需要等到全部準備好。每堂課都從一個可以立刻開始的小任務出發。</p></div>
      <div className="method-list">
        <div><span>01</span><div><h3>選一個眼前的問題</h3><p>從你現在最想解決的事開始。</p></div><ArrowUpRight size={23} /></div>
        <div><span>02</span><div><h3>用短單元建立方法</h3><p>掌握必要觀念，接著就試一次。</p></div><ArrowUpRight size={23} /></div>
        <div><span>03</span><div><h3>留下自己的成果</h3><p>筆記、練習與進度，接著用在工作裡。</p></div><ArrowUpRight size={23} /></div>
      </div>
    </div></section>

    <section className="closing-section"><div className="container closing-inner"><div className="section-kicker">YOUR NEXT CHAPTER STARTS HERE</div><h2>知道了。<br /><em>然後呢？</em></h2><a className="btn btn-primary" href="#/explore">現在開始 <ArrowUpRight size={20} /></a></div></section>
  </main>
}

function Explore({ learning }: { learning: LearningState }) {
  const [category, setCategory] = useState('全部')
  const [query, setQuery] = useState('')
  const results = useMemo(() => courses.filter((course) => {
    const matchesCategory = category === '全部' || course.category === category
    const text = `${course.title} ${course.shortTitle} ${course.subtitle} ${course.description} ${course.category}`.toLowerCase()
    return matchesCategory && text.includes(query.trim().toLowerCase())
  }), [category, query])
  return <main>
    <section className="page-hero explore-hero"><div className="container"><div className="section-kicker">THE COURSE LIBRARY / 01—05</div><h1>找到你的<br /><span>下一步。</span></h1><p>不需要一次學完所有事。先選一個現在用得上的問題。</p></div></section>
    <section className="section catalog-section"><div className="container">
      <div className="catalog-tools"><div className="category-list" aria-label="課程分類">{categories.map((item) => <button type="button" key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-box"><Search size={20} strokeWidth={2} /><span className="sr-only">搜尋課程</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋你想學的主題" /></label></div>
      <div className="results-line"><span>{String(results.length).padStart(2, '0')} 門課程</span><span>依主題探索</span></div>
      {results.length ? <div className="course-grid catalog-grid">{results.map((course) => <CourseCard key={course.slug} course={course} state={learning[course.slug]} />)}</div> : <div className="empty-state"><h2>還沒有符合的課程。</h2><p>試試別的關鍵字，或查看全部主題。</p><button type="button" className="btn btn-ink" onClick={() => { setCategory('全部'); setQuery('') }}>顯示全部課程 <ArrowRight size={18} /></button></div>}
    </div></section>
  </main>
}

function CourseDetail({ course, state, onStart }: { course: Course; state?: CourseState; onStart: (course: Course, index?: number) => void }) {
  const percent = progressFor(course, state)
  const resumeIndex = course.lessons.findIndex((_, index) => !state?.completed.includes(index))
  const chapters = course.chapters || [{ title: '', start: 0, end: course.lessons.length - 1, image: '' }]
  return <main>
    <section className="detail-top"><div className="container"><a className="back-link" href="#/explore"><ArrowLeft size={17} /> 返回所有課程</a></div></section>
    <section className={`detail-hero ${course.provider ? 'detail-hero-featured' : ''}`}><div className="container detail-grid">
      <div className="detail-copy"><div className="section-kicker">{course.category} / {course.level} / CLASS {course.number}</div><h1>{course.title}</h1><p className="detail-subtitle">{course.subtitle}</p><div className="detail-meta"><span><BookOpen size={18} /> {course.lessons.length} {course.provider ? '堂課' : '個單元'}</span><span><Clock3 size={18} /> {course.duration}</span>{course.provider && <span><Play size={18} /> {course.lessons.length} 支影片</span>}</div><p className="detail-description">{course.description}</p><button type="button" className="btn btn-primary" onClick={() => onStart(course, resumeIndex < 0 ? 0 : resumeIndex)}>{state?.started ? '繼續學習' : '開始這堂課'} <ArrowUpRight size={20} /></button><span className="detail-aside">{course.provider ? <>內容來源：<a href={course.sourceUrl} target="_blank" rel="noopener noreferrer">{course.provider} <ArrowUpRight size={13} /></a></> : '示範課程 · 文字導讀與練習'}</span>{state?.started && <span className="detail-progress">已完成 {percent}%</span>}</div>
      <Cover course={course} large />
    </div></section>
    <section className="section outcomes-section"><div className="container outcomes-grid"><div><div className="section-kicker">01 / WHAT YOU WILL DO</div><h2>學完後，<br />你能做到。</h2></div><ol>{course.outcomes.map((outcome, index) => <li key={outcome}><span>{String(index + 1).padStart(2, '0')}</span><p>{outcome}</p><Check size={19} /></li>)}</ol></div></section>
    <section className="section syllabus-section"><div className="container"><div className="section-heading"><div><div className="section-kicker">02 / THE WORK</div><h2>課程單元</h2></div><span className="syllabus-count">{course.lessons.length} LESSONS / {course.duration}</span></div>{chapters.map((chapter, chapterIndex) => <div className="syllabus-chapter" key={chapter.title || 'all'}>{chapter.title && <div className="syllabus-chapter-title"><span>PART {String(chapterIndex + 1).padStart(2, '0')}</span><h3>{chapter.title}</h3><small>{String(chapter.end - chapter.start + 1).padStart(2, '0')} LESSONS</small></div>}<div className="syllabus-list">{course.lessons.slice(chapter.start, chapter.end + 1).map((lesson, offset) => { const index = chapter.start + offset; return <button type="button" key={lesson.title} onClick={() => onStart(course, index)}><span className="syllabus-number">{String(index + 1).padStart(2, '0')}</span><span className="syllabus-content"><strong>{lesson.title}</strong><small>{lesson.summary}</small></span><span className="syllabus-time">{lesson.time}</span><ArrowUpRight size={22} /></button> })}</div></div>)}</div></section>
    <section className="detail-bottom"><div className="container"><div><span className="section-kicker">YOUR NEXT STEP</span><h2>學會一件事。<br />做出一件事。</h2></div><button type="button" className="btn btn-primary" onClick={() => onStart(course)}>開始學習 <ArrowUpRight size={19} /></button></div></section>
  </main>
}

function videoTime(duration?: string) {
  const match = duration?.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/)
  if (!match) return ''
  const hours = Number(match[1] || 0)
  const minutes = Number(match[2] || 0)
  const seconds = Number(match[3] || 0)
  return hours ? `${hours} 小時 ${minutes} 分鐘` : `${minutes} 分 ${String(seconds).padStart(2, '0')} 秒`
}

function LessonBlockContent({ block }: { block: LessonBlock }) {
  if (block.type === 'table' && block.rows?.length) {
    return <div className="reader-table-scroll"><table className="reader-table">
      {block.caption && <caption>{block.caption}</caption>}
      <thead><tr>{block.rows[0].map((cell, index) => <th scope="col" key={index}>{cell}</th>)}</tr></thead>
      <tbody>{block.rows.slice(1).map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
    </table></div>
  }
  if (block.type === 'subheading') return <h3 className="reader-subheading">{block.text}</h3>
  if (block.type === 'listItem') return <p className="reader-list-item">{block.text}</p>
  return <p>{block.text}</p>
}

function Learning({ course, index, state, onComplete, onNote, onStart }: { course: Course; index: number; state?: CourseState; onComplete: (slug: string, index: number) => void; onNote: (slug: string, index: number, text: string) => void; onStart: (course: Course, index?: number) => void }) {
  const lesson = course.lessons[index]
  const percent = progressFor(course, state)
  const done = state?.completed.includes(index) || false
  const chapter = course.chapters?.find((item) => index >= item.start && index <= item.end)
  const lessonNavRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (window.innerWidth > 760) return
    const revealActive = () => {
      const nav = lessonNavRef.current
      const selected = nav?.querySelector<HTMLElement>('[aria-current="page"]')
      if (!nav || !selected) return
      const navBox = nav.getBoundingClientRect()
      const itemBox = selected.getBoundingClientRect()
      if (itemBox.right > navBox.right) nav.scrollLeft += itemBox.right - navBox.right + 8
      else if (itemBox.left < navBox.left) nav.scrollLeft += itemBox.left - navBox.left - 8
    }
    const frame = requestAnimationFrame(revealActive)
    document.fonts.ready.then(revealActive)
    return () => cancelAnimationFrame(frame)
  }, [course.slug, index])
  return <main className="learning-main"><div className="learning-shell">
    <aside className="lesson-sidebar">
      <a className="back-link" href={courseHref(course)}><ChevronLeft size={18} /> 課程介紹</a>
      <div className="sidebar-title"><div className="section-kicker">CLASS {course.number} / {course.category}</div><h2>{course.shortTitle}</h2><p>{course.lessons.length} 個單元 · {course.duration}</p></div>
      <div className="progress-block"><div><span>學習進度</span><strong>{percent}%</strong></div><div className="progress-track" role="progressbar" aria-label="課程完成進度" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div></div>
      {chapter && <div className="sidebar-chapter">目前階段 / {chapter.title}</div>}
      <nav className="lesson-list" aria-label="課程單元" ref={lessonNavRef}>{course.lessons.map((item, itemIndex) => <a href={lessonHref(course, itemIndex)} key={item.title} className={itemIndex === index ? 'current' : ''} aria-current={itemIndex === index ? 'page' : undefined} onClick={() => onStart(course, itemIndex)}><span className="lesson-index">{state?.completed.includes(itemIndex) ? <Check size={16} /> : String(itemIndex + 1).padStart(2, '0')}</span><span>{item.title}<small>{item.videoUrl ? `${videoTime(item.videoDuration)} 影片 · ${item.time}` : item.time}</small></span></a>)}</nav>
      <div className="sidebar-foot">LUXKEY / LEARN BY DOING</div>
    </aside>
    <article className="lesson-content">
      <div className="lesson-topline"><span>單元 {String(index + 1).padStart(2, '0')} / {String(course.lessons.length).padStart(2, '0')}</span><span>{chapter ? chapter.title : '文字導讀'} · {lesson.time}</span></div>
      <div className="lesson-article">
        <div className="section-kicker">THE LESSON / {course.number}.{String(index + 1).padStart(2, '0')}</div>
        <h1>{lesson.title}</h1><p className="lesson-lead">{lesson.summary}</p>
        {lesson.videoUrl && <div className="lesson-video-wrap"><video key={`${course.slug}-${index}`} controls playsInline preload="metadata" poster={chapter?.image || '/images/luxkey-ziwei.webp'} src={lesson.videoUrl}>你的瀏覽器不支援影片播放。<a href={lesson.videoUrl}>開啟影片</a></video><div className="lesson-video-caption"><span><Play size={16} /> 紫微宇宙課程影片 · {videoTime(lesson.videoDuration)}</span><a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer">影片無法播放？開啟原始檔 <ArrowUpRight size={15} /></a></div></div>}
        <div className="reader-notice"><BookOpen size={22} /><div><strong>{lesson.videoUrl ? '看影片、讀課文，然後動手排盤。' : '先讀，再動手。'}</strong><span>{lesson.videoUrl ? '課文來自紫微宇宙。每堂的對答案工具可在原課頁使用。' : '這是示範版課堂。閱讀重點後，完成下面的小練習。'}</span></div></div>
        {lesson.sections.map((section, sectionIndex) => <section className="lesson-section" key={section.heading}><div className="section-kicker">{String(sectionIndex + 1).padStart(2, '0')} / KEY IDEA</div><h2>{section.heading}</h2>{section.blocks ? section.blocks.map((block, blockIndex) => <LessonBlockContent key={blockIndex} block={block} />) : <p>{section.body}</p>}</section>)}
        <section className="exercise-box"><div className="section-kicker">DO THE WORK</div><h2>現在，換你試試。</h2><p>{lesson.exercise}</p>{lesson.sourceUrl && <a href={lesson.sourceUrl} target="_blank" rel="noopener noreferrer">開啟原課頁與對答案工具 <ArrowUpRight size={18} /></a>}</section>
        {lesson.sourceUrl && <p className="lesson-source-note">內容來源：<a href={lesson.sourceUrl} target="_blank" rel="noopener noreferrer">紫微宇宙第 {index + 1} 課 <ArrowUpRight size={14} /></a>。紫微斗數是傳統自我探索工具；健康、法律或財務問題請諮詢相應專業人士。</p>}
        <section className="notes-block"><label htmlFor="lesson-notes">你的課堂筆記 <span>自動儲存在此瀏覽器</span></label><textarea id="lesson-notes" value={state?.notes[index] || ''} onChange={(event) => onNote(course.slug, index, event.target.value)} placeholder="寫下你的想法、問題或練習成果…" rows={6} /></section>
        <div className="lesson-actions"><button className={`btn ${done ? 'btn-complete' : 'btn-primary'}`} type="button" onClick={() => onComplete(course.slug, index)}>{done ? <CheckCircle2 size={19} /> : <Check size={19} />}{done ? '已完成本單元' : '標記為已完成'}</button>{index < course.lessons.length - 1 ? <a className="text-link" href={lessonHref(course, index + 1)} onClick={() => onStart(course, index + 1)}>下一單元 <ArrowRight size={19} /></a> : <a className="text-link" href="#/my-learning">回到我的學習 <ArrowRight size={19} /></a>}</div>
      </div>
      <div className="lesson-pager">{index > 0 ? <a href={lessonHref(course, index - 1)} onClick={() => onStart(course, index - 1)}><ChevronLeft size={19} /> 上一單元</a> : <span />}{index < course.lessons.length - 1 ? <a href={lessonHref(course, index + 1)} onClick={() => onStart(course, index + 1)}>下一單元 <ChevronRight size={19} /></a> : <span />}</div>
    </article>
  </div></main>
}

function MyLearning({ learning, onStart }: { learning: LearningState; onStart: (course: Course, index?: number) => void }) {
  const started = courses.filter((course) => learning[course.slug]?.started)
  return <main><section className="page-hero library-hero"><div className="container"><div className="section-kicker">MY LEARNING / YOUR PACE</div><h1>繼續往前，<br /><span>一步一步。</span></h1><p>你開始的課，都在這裡。</p></div></section><section className="section library-section"><div className="container"><div className="section-heading"><div><div className="section-kicker">學習記錄</div><h2>正在學習</h2></div><span>{String(started.length).padStart(2, '0')} 門課程</span></div>{started.length ? <div className="library-grid">{started.map((course) => { const state = learning[course.slug]; const next = course.lessons.findIndex((_, index) => !state.completed.includes(index)); const percent = progressFor(course, state); return <div className="library-card" key={course.slug}><Cover course={course} /><div className="library-card-content"><div className="card-meta">{course.category} / {course.lessons.length} 個單元</div><h3>{course.title}</h3><div className="progress-block"><div><span>已完成</span><strong>{percent}%</strong></div><div className="progress-track" role="progressbar" aria-label={`${course.title} 完成進度`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div></div><button type="button" className="text-link" onClick={() => onStart(course, next < 0 ? 0 : next)}>{percent === 100 ? '重新閱讀' : '繼續學習'} <ArrowRight size={18} /></button></div></div> })}</div> : <div className="empty-state"><BookOpen size={34} strokeWidth={1.5} /><h2>你的下一步，從這裡開始。</h2><p>選一門現在最用得上的課，學習記錄就會出現在這裡。</p><a className="btn btn-primary" href="#/explore">探索課程 <ArrowUpRight size={18} /></a></div>}</div></section></main>
}

export default function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const [learning, setLearning] = useState<LearningState>(readLearning)
  useEffect(() => {
    const update = () => { setRoute(readRoute()); window.scrollTo({ top: 0, behavior: 'instant' }) }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  useEffect(() => { localStorage.setItem('luxkey-learning-v1', JSON.stringify(learning)) }, [learning])

  const onStart = (course: Course, index = 0) => {
    setLearning((current) => ({ ...current, [course.slug]: { started: true, completed: current[course.slug]?.completed || [], notes: current[course.slug]?.notes || {} } }))
    window.location.hash = `/learn/${course.slug}/${index}`
  }
  const onComplete = (slug: string, index: number) => setLearning((current) => {
    const old = current[slug] || { started: true, completed: [], notes: {} }
    return { ...current, [slug]: { ...old, completed: old.completed.includes(index) ? old.completed : [...old.completed, index] } }
  })
  const onNote = (slug: string, index: number, text: string) => setLearning((current) => {
    const old = current[slug] || { started: true, completed: [], notes: {} }
    return { ...current, [slug]: { ...old, notes: { ...old.notes, [index]: text } } }
  })

  const routeCourse = 'slug' in route ? courses.find((course) => course.slug === route.slug) : undefined
  const validLesson = route.page === 'lesson' && routeCourse && Number.isInteger(route.index) && route.index >= 0 && route.index < routeCourse.lessons.length
  let content
  if (route.page === 'home') content = <Home learning={learning} />
  else if (route.page === 'explore') content = <Explore learning={learning} />
  else if (route.page === 'library') content = <MyLearning learning={learning} onStart={onStart} />
  else if (route.page === 'course' && routeCourse) content = <CourseDetail course={routeCourse} state={learning[routeCourse.slug]} onStart={onStart} />
  else if (route.page === 'lesson' && routeCourse && validLesson) content = <Learning course={routeCourse} index={route.index} state={learning[routeCourse.slug]} onComplete={onComplete} onNote={onNote} onStart={onStart} />
  else content = <main className="not-found container"><div className="section-kicker">404 / PAGE NOT FOUND</div><h1>這一頁，還沒寫好。</h1><a className="btn btn-primary" href="#/">回到首頁 <ArrowRight size={18} /></a></main>

  return <><Header route={route} />{content}<Footer /></>
}
