import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Clock3,
  Menu,
  Play,
  Search,
  X,
} from 'lucide-react'
import { categories, courses, ziweiCourse, type Course, type LessonBlock } from './data'
import { capstoneFields, chapterChecks, lessonActivities } from './ziwei-assessments'
import { palacePattern, ziweiHighlights } from './ziwei-highlights'
import { marketRates } from './market-rates'
import { formatTwd, proposedCoursePrices, validCoursePrice, type CoursePrice } from './course-pricing'

type CoursePrices = Record<string, CoursePrice>
const pricingApiUrl = import.meta.env.VITE_PRICING_API_URL as string | undefined

type Route =
  | { page: 'home' }
  | { page: 'explore' }
  | { page: 'library' }
  | { page: 'course'; slug: string }
  | { page: 'lesson'; slug: string; index: number }
  | { page: 'pricing-admin' }
  | { page: 'not-found' }

type CourseState = {
  started: boolean
  completed: number[]
  notes: Record<number, string>
  activities?: Record<number, string>
  checkAnswers?: Record<number, number[]>
  checkPassed?: number[]
  capstone?: Record<string, string>
  capstoneSubmitted?: boolean
}
type LearningState = Record<string, CourseState>

function readRoute(): Route {
  const path = window.location.hash.replace(/^#/, '') || '/'
  if (path === '/') return { page: 'home' }
  if (path === '/explore') return { page: 'explore' }
  if (path === '/my-learning') return { page: 'library' }
  if (path === '/admin/pricing') return { page: 'pricing-admin' }
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
function assetPath(path: string) { return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}` }
function scrollToSection(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }) }
function progressFor(course: Course, state?: CourseState) {
  const completed = state?.completed.filter((index) => index >= 0 && index < course.lessons.length).length || 0
  if (course.slug !== ziweiCourse.slug) return Math.round((completed / course.lessons.length) * 100)
  const checks = ziweiCourse.chapters?.length || 0
  const passed = state?.checkPassed?.filter((index) => chapterChecks[index]).length || 0
  return Math.round(((completed + passed + (state?.capstoneSubmitted ? 1 : 0)) / (course.lessons.length + checks + 1)) * 100)
}
function resumeLessonIndex(course: Course, state?: CourseState) {
  const nextLesson = course.lessons.findIndex((_, index) => !state?.completed.includes(index))
  if (nextLesson >= 0) return nextLesson
  if (course.slug === ziweiCourse.slug) {
    const pendingCheck = Object.keys(chapterChecks).map(Number).find((index) => !state?.checkPassed?.includes(index))
    if (pendingCheck !== undefined) return pendingCheck
    if (!state?.capstoneSubmitted) return course.lessons.length - 1
  }
  return 0
}

function Header({ route }: { route: Route }) {
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [route])
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#/" aria-label="Free & Wealthy 自由至富 AI技能學院首頁">
            <span className="brand-name">Free <span>&amp;</span> Wealthy</span><span className="brand-sub"><strong>自由至富</strong> <span>AI技能學院</span></span>
          </a>
          <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="主選單">
            <a href="#/explore" className={route.page === 'explore' ? 'active' : ''}>探索課程</a>
            <a href="#/my-learning" className={route.page === 'library' || route.page === 'lesson' ? 'active' : ''}>我的學習</a>
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
    <div><div className="footer-brand"><span className="brand-name footer-logo">Free <span>&amp;</span> Wealthy</span><span className="brand-sub"><strong>自由至富</strong> <span>AI技能學院</span></span></div><p>用 AI 槓桿一人公司，通往時間與財富的極致自由。</p></div>
    <div className="footer-links"><a href="#/explore">探索課程</a><a href="#/my-learning">我的學習</a><a href="#/">回到首頁</a></div>
    <span className="footer-note">Free & Wealthy · 自由至富 AI技能學院</span>
  </div></footer>
}

const originalCoverImages: Record<string, string> = {
  'ziwei-foundations': '/images/luxkey-ziwei.webp',
  'tarot-practice': '/images/luxkey-tarot.webp',
}

function TuitionPrice({ price, compact = false }: { price: CoursePrice; compact?: boolean }) {
  if (compact) return <div className="tuition-price tuition-price-compact">
    <span className="tuition-caption">課程學費 {price.status === 'planned' && <em>規劃中</em>}</span>
    <div className="tuition-compact-values"><s>{formatTwd(price.listPrice)}</s><strong>{formatTwd(price.currentPrice)}</strong></div>
  </div>
  return <div className={`tuition-price ${compact ? 'tuition-price-compact' : ''}`}>
    <span className="tuition-caption">課程價格 {price.status === 'planned' && <em>規劃中</em>}</span>
    <div><span>定價</span>{price.status === 'planned' ? <b className="tuition-list">{formatTwd(price.listPrice)}</b> : <s>{formatTwd(price.listPrice)}</s>}</div>
    <div className="tuition-current"><span>現在售價</span><strong>{formatTwd(price.currentPrice)}</strong></div>
  </div>
}

function CourseCard({ course, state, prices }: { course: Course; state?: CourseState; prices: CoursePrices }) {
  const percent = progressFor(course, state)
  const price = prices[course.slug] || proposedCoursePrices[course.slug]
  return <a className="course-card" href={courseHref(course)}>
    <div className="course-card-media"><img src={assetPath(course.coverImage || originalCoverImages[course.slug])} alt="" loading="lazy" decoding="async" /><span className="course-card-format">{course.provider ? '20 堂完整課程' : '文字試學'}</span></div>
    <div className="course-card-body">
      <div className="card-meta"><span>{course.number} / {course.category}</span>{state?.started && <span>{percent}% 已完成</span>}</div>
      <h3>{course.title}</h3><p>{course.subtitle}</p>
      <div className="course-pricing"><TuitionPrice price={price} compact /></div>
      <div className="card-action"><span>{state?.started ? '繼續學習' : '查看課程'}</span><ArrowUpRight size={18} /></div>
    </div>
  </a>
}

function Home({ prices }: { prices: CoursePrices }) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const scrollRail = (direction: number) => {
    const rail = railRef.current
    if (rail) rail.scrollBy({ left: rail.clientWidth * .8 * direction, behavior: 'smooth' })
  }
  const recommended = courses.find((course) => course.slug === selectedGoal)
  const goals = [
    { slug: 'ziwei-foundations', label: '成為線上紫微命理師' },
    { slug: 'tarot-practice', label: '把塔羅練習變成諮詢服務' },
    { slug: 'website-building', label: '幫客戶做網站' },
    { slug: 'social-graphic-editor', label: '接圖文小編的案子' },
    { slug: 'ai-video-editing', label: '用 AI 幫客戶剪短片' },
  ]
  return <main>
    <section className="hero-section" style={{ backgroundImage: `url("${assetPath('/images/ai-rich-learning-hero.webp')}")` }}><div className="container hero-grid">
      <div className="hero-copy">
        <div className="section-kicker"><span className="kicker-line" /> 自由至富 AI技能學院</div>
        <h1 className="hero-headline">建立你的一人公司，<br /><span>把技能變成第一筆收入</span></h1>
        <p className="hero-promise">用 AI 槓桿一人公司，通往時間與財富的極致自由。</p>
        <div className="hero-actions"><button type="button" className="btn btn-primary" onClick={() => document.getElementById('find-path')?.scrollIntoView({ behavior: 'smooth' })}>找到適合我的課 <ArrowUpRight size={19} /></button></div>
      </div>
      <div className="hero-image-caption"><span>從一門課，開始你的第一份作品</span><span>課程情境示意</span></div>
    </div></section>

    <section className="principles"><div className="container principles-grid">
      <span className="principles-label">先學會，再動手</span>
      <p>知識，<em>要能用。</em></p>
      <span className="principles-caption">13 門課 · 從練習到作品</span>
    </div></section>

    <section className="path-section" id="find-path"><div className="container path-grid">
      <div className="path-intro"><div className="section-kicker">找到適合你的起點</div><h2>賺錢方法很多，<br /><span>找到適合你的</span></h2><span className="path-small">想更了解自己？可以先<a href="https://www.ziweiuniverse.com/" target="_blank" rel="noopener noreferrer">算算紫微 <ArrowUpRight size={13} /></a></span></div>
      <div className="path-panel"><div className="path-panel-top"><span>你想先做哪件事？</span></div><div className="path-options" role="group" aria-label="選擇學習目標">{goals.map((goal, index) => <button type="button" key={goal.slug} className={selectedGoal === goal.slug ? 'selected' : ''} aria-pressed={selectedGoal === goal.slug} onClick={() => setSelectedGoal(goal.slug)}><span className="path-option-number">{String(index + 1).padStart(2, '0')}</span><span>{goal.label}</span><ArrowUpRight size={20} /></button>)}</div>{recommended ? <div className="path-result" aria-live="polite"><span>推薦課程</span><strong>{recommended.title}</strong><a href={courseHref(recommended)}>查看課程 <ArrowRight size={18} /></a></div> : <div className="path-prompt">選一個方向，看看適合你的課。<ArrowRight size={18} /></div>}</div>
    </div></section>

    <section className="spotlight-section"><div className="container spotlight-grid">
      <a className="spotlight-image" style={{ backgroundImage: `url("${assetPath('/images/ziwei-teaching-scene.webp')}")` }} href={courseHref(ziweiCourse)} aria-label="查看紫微斗數入門課程"><span>紫微斗數入門</span><span>課程情境示意 · 非講師本人</span></a>
      <div className="spotlight-copy"><div className="section-kicker">第一門完整課 / 紫微宇宙</div><h2>20 堂課，<br /><span>完成第一份解盤作品。</span></h2><p>從排盤到解讀，跟著示範練習，留下自己的作品。</p><div className="spotlight-facts"><span>20 堂課</span><span>6 個階段</span></div><a className="btn btn-primary" href={courseHref(ziweiCourse)}>查看紫微課程 <ArrowUpRight size={19} /></a></div>
    </div></section>

    <section className="section courses-section"><div className="container">
      <div className="section-heading shelf-heading"><div><div className="section-kicker">接下來想學什麼？</div><h2>從一門課，<br />做出第一個服務。</h2></div><div className="shelf-controls"><button type="button" aria-label="往前看課程" onClick={() => scrollRail(-1)}><ArrowLeft size={20} /></button><button type="button" aria-label="往後看課程" onClick={() => scrollRail(1)}><ArrowRight size={20} /></button></div></div>
      <div className="course-rail" ref={railRef} tabIndex={0} aria-label="精選課程，左右滑動瀏覽">{courses.slice(1, 8).map((course) => { const price = prices[course.slug] || proposedCoursePrices[course.slug]; return <a className="course-rail-card" key={course.slug} href={courseHref(course)}><div className="rail-image"><img src={assetPath(course.coverImage || originalCoverImages[course.slug])} alt="" loading="lazy" decoding="async" /></div><div className="rail-card-content"><span className="rail-index">{course.number} / {course.category}</span><h3>{course.shortTitle}</h3><p>{course.subtitle}</p><div className="rail-card-foot"><TuitionPrice price={price} compact /><ArrowUpRight size={20} /></div></div></a> })}</div><div className="shelf-bottom"><p>學費為完整課程規劃價；目前可試學，尚未開放購買。</p><a href="#/explore" className="text-link">探索全部 13 門課 <ArrowUpRight size={18} /></a></div>
    </div></section>

    <section className="method-section" id="how"><div className="container method-grid">
      <div className="method-intro"><div className="section-kicker">學習方式</div><h2>學了，<br /><span>就動手。</span></h2></div>
      <div className="method-list">
        <div><span>01</span><div><h3>看示範</h3></div><ArrowUpRight size={23} /></div>
        <div><span>02</span><div><h3>動手做</h3></div><ArrowUpRight size={23} /></div>
        <div><span>03</span><div><h3>帶走作品</h3></div><ArrowUpRight size={23} /></div>
      </div>
    </div></section>

    <section className="closing-section"><div className="container closing-inner"><div className="section-kicker">把想法做成下一步</div><h2>今天上課、<br /><em>明天接單</em></h2><a className="btn btn-primary" href="#/explore">現在開始 <ArrowUpRight size={20} /></a></div></section>
  </main>
}

function Explore({ learning, prices }: { learning: LearningState; prices: CoursePrices }) {
  const [category, setCategory] = useState('全部')
  const [query, setQuery] = useState('')
  const results = useMemo(() => courses.filter((course) => {
    const matchesCategory = category === '全部' || course.category === category
    const text = `${course.title} ${course.shortTitle} ${course.subtitle} ${course.description} ${course.category}`.toLowerCase()
    return matchesCategory && text.includes(query.trim().toLowerCase())
  }), [category, query])
  return <main>
    <section className="page-hero explore-hero"><div className="container explore-hero-grid"><div><div className="section-kicker">探索課程</div><h1>原來沒這麼難</h1><p>選一項技能，做出第一份作品。</p></div><span className="explore-hero-count">13 門課程 · 可公開試學</span></div></section>
    <section className="section catalog-section"><div className="container">
      <div className="catalog-tools"><div className="category-list" aria-label="課程分類">{categories.map((item) => <button type="button" key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-box"><Search size={20} strokeWidth={2} /><span className="sr-only">搜尋課程</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋你想學的主題" /></label></div>
      <div className="results-line"><span>{String(results.length).padStart(2, '0')} 門課程</span><span>可公開試學 · 尚未開放購買</span></div><details className="catalog-info"><summary>關於試學內容與學費</summary><p>售價為未來完整課程的規劃價。紫微課目前有 20 堂內容；其他課程為文字試學版。外部接案行情在課程頁另列，並非課程學費。</p></details>
      {results.length ? <div className="course-grid catalog-grid">{results.map((course) => <CourseCard key={course.slug} course={course} state={learning[course.slug]} prices={prices} />)}</div> : <div className="empty-state"><h2>還沒有符合的課程。</h2><p>試試別的關鍵字，或查看全部主題。</p><button type="button" className="btn btn-ink" onClick={() => { setCategory('全部'); setQuery('') }}>顯示全部課程 <ArrowRight size={18} /></button></div>}
    </div></section>
  </main>
}

function CourseDetail({ course, state, onStart, prices }: { course: Course; state?: CourseState; onStart: (course: Course, index?: number) => void; prices: CoursePrices }) {
  const percent = progressFor(course, state)
  const market = marketRates[course.slug]
  const price = prices[course.slug] || proposedCoursePrices[course.slug]
  const resumeIndex = resumeLessonIndex(course, state)
  const chapters = course.chapters || [{ title: '', start: 0, end: course.lessons.length - 1, image: '' }]
  const visual = course.slug === ziweiCourse.slug ? '/images/ziwei-teaching-scene.webp' : course.coverImage || originalCoverImages[course.slug]
  const [openChapter, setOpenChapter] = useState(0)
  const [activeSection, setActiveSection] = useState('course-outcomes')
  useEffect(() => setOpenChapter(0), [course.slug])
  useEffect(() => {
    const updateSection = () => {
      for (const id of ['lesson-plan', 'course-pricing', 'course-outcomes']) {
        const section = document.getElementById(id)
        if (section && section.getBoundingClientRect().top <= 195) {
          setActiveSection(id)
          return
        }
      }
      setActiveSection('course-outcomes')
    }
    window.addEventListener('scroll', updateSection, { passive: true })
    updateSection()
    return () => window.removeEventListener('scroll', updateSection)
  }, [course.slug])
  return <main>
    <section className="detail-top"><div className="container"><a className="back-link" href="#/explore"><ArrowLeft size={17} /> 返回所有課程</a></div></section>
    <section className={`detail-hero ${course.provider ? 'detail-hero-featured' : ''}`}><div className="container detail-grid">
      <figure className="detail-visual"><img src={assetPath(visual)} alt={`${course.shortTitle}的課程情境示意`} /><figcaption>課程情境示意 · 非講師本人</figcaption></figure>
      <div className="detail-copy"><div className="section-kicker">{course.category} / CLASS {course.number}</div><h1>{course.title}</h1><p className="detail-subtitle">{course.subtitle}</p><div className="detail-meta"><span><BookOpen size={18} /> {course.lessons.length} {course.provider ? '堂課' : '個單元'}</span><span><Clock3 size={18} /> {course.duration}</span></div><div className="detail-hero-actions"><button type="button" className="btn btn-primary" onClick={() => onStart(course, resumeIndex)}>{state?.started ? '繼續學習' : course.provider ? '免費預覽第一堂' : '開始文字試學'} <ArrowUpRight size={20} /></button></div>{state?.started && <span className="detail-progress">已完成 {percent}%</span>}</div>
    </div></section>
    <nav className="course-section-nav" aria-label="課程內容導覽"><div className="container"><button type="button" className={activeSection === 'course-outcomes' ? 'is-active' : ''} onClick={() => scrollToSection('course-outcomes')}>學完能做什麼</button><button type="button" className={activeSection === 'course-pricing' ? 'is-active' : ''} onClick={() => scrollToSection('course-pricing')}>學費與接案行情</button><button type="button" className={activeSection === 'lesson-plan' ? 'is-active' : ''} onClick={() => scrollToSection('lesson-plan')}>課程路線</button></div></nav>
    <section className="section outcomes-section" id="course-outcomes"><div className="container outcomes-grid"><div><div className="section-kicker">學完能做什麼</div><h2>從學習，<br />走向作品。</h2><p className="outcomes-intro">{course.description}</p><small>{course.provider ? `課程內容提供：${course.provider}` : '目前提供文字導讀與練習，尚無講師影片'}</small></div><ol>{course.outcomes.map((outcome, index) => <li key={outcome}><span>{String(index + 1).padStart(2, '0')}</span><p>{outcome}</p><Check size={19} /></li>)}</ol></div></section>
    <section className="section course-offer-section" id="course-pricing" aria-labelledby="course-offer-title"><div className="container course-offer-grid"><div className="course-offer-intro"><div className="section-kicker">費用與服務</div><h2 id="course-offer-title">先看學費，<br />再看接案行情。</h2><p>目前可公開試學，尚未開放購買。接案行情是外部服務報價，並非學費或收入保證。</p>{(course.aiUse || course.provider) && <details className="course-extra"><summary>這門課的學習準備</summary>{course.aiUse && <p><strong>AI 的用法</strong>{course.aiUse}</p>}{course.provider && <p><strong>課前準備</strong>出生年月日與時辰、紙筆；每次安排 20–30 分鐘。</p>}</details>}</div><div className="course-offer-rates"><div className="detail-tuition"><TuitionPrice price={price} /><p>完整課程價格規劃；尚未開放購買。<a href="https://github.com/VitoKOK-lab/101-Ways-to-Get-Rich-Using-AI/blob/main/docs/course-tuition-benchmark.md" target="_blank" rel="noopener noreferrer">查看學費調查依據</a></p></div><div className="detail-market"><span>外部接案行情 · 非學費</span><strong>{market.price}<small>{market.unit}</small></strong><details className="market-more"><summary>查看計價方式與服務範圍</summary><ul className="market-rate-tiers">{market.tiers.map((tier) => <li key={tier.label}><span>{tier.label}</span><b>{tier.price}<small>{tier.unit}</small></b></li>)}</ul><p>{market.scope}</p></details><p>經營者提供的台灣報價參考，尚未獨立查證；實際價格依服務內容而定。</p></div></div></div></section>
    <section className="section syllabus-section" id="lesson-plan"><div className="container"><div className="section-heading"><div><div className="section-kicker">課程路線</div><h2>{course.chapters ? '6 個階段，20 堂課。' : '從這裡開始。'}</h2></div><span className="syllabus-count">{course.lessons.length} 堂課 / {course.duration}</span></div>{course.chapters && <div className="module-grid" aria-label="六個學習階段">{chapters.map((chapter, chapterIndex) => <button className="module-card" type="button" key={chapter.title} onClick={() => { setOpenChapter(chapterIndex); scrollToSection('full-plan') }}><img className="module-image" src={assetPath(chapter.image)} alt={`${chapter.title}：${chapter.goal}`} loading="lazy" decoding="async" /><span className="module-meta">階段 {String(chapterIndex + 1).padStart(2, '0')} · {chapter.end - chapter.start + 1} 堂課</span><strong>{chapter.title}</strong></button>)}</div>}<div className="lesson-plan-head" id="full-plan"><h3>{course.chapters ? '選擇階段，查看課次' : '選擇單元，開始學習'}</h3></div>{chapters.map((chapter, chapterIndex) => <div className="syllabus-chapter" key={chapter.title || 'all'}>{chapter.title && <button className="syllabus-chapter-title" type="button" aria-expanded={openChapter === chapterIndex} onClick={() => setOpenChapter(openChapter === chapterIndex ? -1 : chapterIndex)}><span>PART {String(chapterIndex + 1).padStart(2, '0')}</span><h3>{chapter.title}</h3><small>{String(chapter.end - chapter.start + 1).padStart(2, '0')} LESSONS</small><ChevronDown size={20} /></button>}{(!course.chapters || openChapter === chapterIndex) && <>{chapter.goal && <p className="chapter-goal">這一階段完成：{chapter.goal}</p>}<div className={`syllabus-list ${course.provider ? 'syllabus-list-illustrated' : ''}`}>{course.lessons.slice(chapter.start, chapter.end + 1).map((lesson, offset) => { const index = chapter.start + offset; return <button type="button" key={lesson.title} onClick={() => onStart(course, index)}>{lesson.image ? <span className="syllabus-thumb"><img src={assetPath(lesson.image)} alt="" loading="lazy" decoding="async" /><span>{String(index + 1).padStart(2, '0')}</span></span> : <span className="syllabus-number">{String(index + 1).padStart(2, '0')}</span>}<span className="syllabus-content"><strong>{lesson.title}</strong></span><span className="syllabus-time">{lesson.videoUrl ? `${videoTime(lesson.videoDuration)} 影片` : lesson.time}</span><Play size={18} /></button> })}</div></>}</div>)}</div></section>
    <section className="detail-bottom"><div className="container"><div><span className="section-kicker">從這裡開始</span><h2>學會一件事。<br />做出一件事。</h2></div><button type="button" className="btn btn-primary" onClick={() => onStart(course)}>開始學習 <ArrowUpRight size={19} /></button></div></section>
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

function markPalaces(text: string) {
  return text.split(palacePattern).map((part, partIndex) =>
    partIndex % 2 ? <mark className="palace-highlight" key={partIndex}>{part}</mark> : part,
  )
}

function annotatedText(text: string | undefined, lessonIndex?: number, keyIdea?: string) {
  if (!text) return null
  const format = (part: string) => lessonIndex === undefined ? part : markPalaces(part)
  const position = keyIdea ? text.indexOf(keyIdea) : -1
  if (position < 0 || !keyIdea) return format(text)
  return <>{format(text.slice(0, position))}<mark className="teaching-highlight"><strong>{keyIdea}</strong></mark>{format(text.slice(position + keyIdea.length))}</>
}

function LessonBlockContent({ block, lessonIndex, keyIdea }: { block: LessonBlock; lessonIndex?: number; keyIdea: string }) {
  if (block.type === 'table' && block.rows?.length) {
    const isCourseMap = block.caption === '紫微斗數排盤課程的四個部分'
    const widestRow = Math.max(...block.rows.map((row) => row.length))
    return <><span className="table-scroll-cue">← 左右滑動查看完整表格 →</span><div className="reader-table-scroll" tabIndex={0} role="region" aria-label={`${block.caption || '課程表格'}，窄螢幕可左右滑動`}><table className={`reader-table ${isCourseMap ? 'reader-table-course-map' : ''}`} style={{ minWidth: isCourseMap ? 760 : Math.max(560, widestRow * 105) }}>
      {block.caption && <caption>{block.caption}</caption>}
      {isCourseMap && <colgroup><col style={{ width: 96 }} /><col style={{ width: 185 }} /><col style={{ width: 170 }} /><col /></colgroup>}
      <thead><tr>{block.rows[0].map((cell, index) => <th scope="col" key={index}>{annotatedText(cell, lessonIndex)}</th>)}</tr></thead>
      <tbody>{block.rows.slice(1).map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}>{annotatedText(cell, lessonIndex)}</th> : <td key={cellIndex}>{annotatedText(cell, lessonIndex)}</td>)}</tr>)}</tbody>
    </table></div></>
  }
  if (block.type === 'subheading') return <h3 className="reader-subheading">{annotatedText(block.text, lessonIndex, keyIdea)}</h3>
  if (block.type === 'listItem') return <p className="reader-list-item">{annotatedText(block.text, lessonIndex, keyIdea)}</p>
  return <p>{annotatedText(block.text, lessonIndex, keyIdea)}</p>
}

const ziweiSteps = ['lunar', 'lunar', 'lunar', 'grid', 'life', 'stems', 'five', 'ziwei', 'ziweiGroup', 'tianfuGroup', 'lucky', 'tough', 'mutagen', 'decades', 'full', 'read', 'empty', 'topics', 'decadeNow', 'yearly']

function ZiweiChecker({ index }: { index: number }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    setError(false)
    import('./ziwei/check.js').then((module) => {
      if (active && boxRef.current) module.mount(boxRef.current)
    }).catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [index])
  return <section className="ziwei-check-section"><div className="section-kicker">CHECK YOUR CHART / 本站工具</div><h2>核對這一步的命盤</h2><p>輸入出生資料，本站會顯示排到這一課的盤面與步驟。資料只在這台裝置計算。</p><div className="zw-check" ref={boxRef} data-step={ziweiSteps[index]} data-engine={assetPath('/ziwei/core/zw-engine.js')} />{error && <p role="alert">排盤工具暫時無法載入，請重新整理後再試。</p>}</section>
}

function StageCheck({ index, state, onAnswer, onPass }: { index: number; state?: CourseState; onAnswer: (index: number, question: number, answer: number) => void; onPass: (index: number) => void }) {
  const check = chapterChecks[index]
  const answers = state?.checkAnswers?.[index] || []
  const passed = state?.checkPassed?.includes(index) || false
  const [submitted, setSubmitted] = useState(false)
  useEffect(() => setSubmitted(false), [index])
  if (!check) return null
  const score = check.questions.reduce((total, question, questionIndex) => total + (answers[questionIndex] === question.answer ? 1 : 0), 0)
  const needed = Math.ceil(check.questions.length * .66)
  return <section className="stage-check"><div className="section-kicker">CHECKPOINT / 學習檢核</div><h2>{check.title}</h2><p>看完這一階段，先回答問題，確認自己能說出方法。答錯可以重做。</p><div className="check-questions">{check.questions.map((question, questionIndex) => <fieldset key={question.prompt}><legend><span>{String(questionIndex + 1).padStart(2, '0')}</span>{question.prompt}</legend><div className="check-options">{question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={`check-${index}-${questionIndex}`} checked={answers[questionIndex] === optionIndex} disabled={passed} onChange={() => { onAnswer(index, questionIndex, optionIndex); setSubmitted(false) }} /><span>{option}</span></label>)}</div>{submitted && answers[questionIndex] !== question.answer && <p className="check-explanation">{question.explanation}</p>}</fieldset>)}</div>{!passed && <button type="button" className="btn btn-ink" disabled={!check.questions.every((_, questionIndex) => Number.isInteger(answers[questionIndex]))} onClick={() => { setSubmitted(true); if (score >= needed) onPass(index) }}>送出測驗 <ArrowRight size={17} /></button>}{(submitted || passed) && <p className={score >= needed || passed ? 'check-result is-passed' : 'check-result'} role="status">{score >= needed || passed ? `已通過 · ${score} / ${check.questions.length} 題正確` : `答對 ${score} / ${check.questions.length} 題；至少需答對 ${needed} 題，請依提示再試一次。`}</p>}</section>
}

function Capstone({ state, onChange, onSubmit }: { state?: CourseState; onChange: (field: string, value: string) => void; onSubmit: () => void }) {
  const fields = state?.capstone || {}
  const ready = capstoneFields.every((field) => (fields[field.key] || '').trim().length >= 30)
  return <section className="capstone-section"><div className="section-kicker">FINAL PROJECT / 結業作品</div><h2>做一份可展示的解盤服務草稿</h2><p>把所學用在一個完整案例：先解讀，再設計諮詢流程和服務界線。請使用虛構或匿名資料，保護真實個案隱私。</p>{capstoneFields.map((field) => <label className="capstone-field" key={field.key}><strong>{field.label}</strong><span>{field.prompt}</span><textarea value={fields[field.key] || ''} onChange={(event) => onChange(field.key, event.target.value)} rows={5} placeholder="寫下你的作品內容，至少 30 字" /></label>)}<button type="button" className="btn btn-primary" disabled={!ready || !state?.checkPassed?.includes(19)} onClick={onSubmit}>{state?.capstoneSubmitted ? '已儲存作品草稿' : '儲存結業作品草稿'} <Check size={18} /></button><p className="capstone-note">{!state?.checkPassed?.includes(19) && '請先通過上方結業測驗。'}目前作品只保存在此瀏覽器，尚未經講師評閱，也不構成營業資格認證。</p></section>
}

function Learning({ course, index, state, onComplete, onNote, onActivity, onCheckAnswer, onCheckPass, onCapstoneChange, onCapstoneSubmit, onStart }: { course: Course; index: number; state?: CourseState; onComplete: (slug: string, index: number) => void; onNote: (slug: string, index: number, text: string) => void; onActivity: (index: number, text: string) => void; onCheckAnswer: (index: number, question: number, answer: number) => void; onCheckPass: (index: number) => void; onCapstoneChange: (field: string, value: string) => void; onCapstoneSubmit: () => void; onStart: (course: Course, index?: number) => void }) {
  const lesson = course.lessons[index]
  const percent = progressFor(course, state)
  const done = state?.completed.includes(index) || false
  const chapter = course.chapters?.find((item) => index >= item.start && index <= item.end)
  const [videoStarted, setVideoStarted] = useState(false)
  useEffect(() => setVideoStarted(false), [course.slug, index])
  const isZiwei = course.slug === ziweiCourse.slug
  const activity = state?.activities?.[index] || ''
  const canComplete = !isZiwei || activity.trim().length >= 12
  return <main className="learning-main"><div className="learning-shell">
    <aside className="lesson-sidebar">
      <a className="back-link" href={courseHref(course)}><ChevronLeft size={18} /> 課程介紹</a>
      <div className="sidebar-title"><div className="section-kicker">課程目錄 / {course.number}</div><h2>{course.shortTitle}</h2></div>
      <div className="progress-block"><div><span>學習進度</span><strong>{percent}%</strong></div><div className="progress-track" role="progressbar" aria-label="課程完成進度" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div></div>
      <details className="lesson-nav-panel" key={`${course.slug}-${index}`} open={window.innerWidth > 760}><summary><span>第 {String(index + 1).padStart(2, '0')} 課 · {lesson.title}</span><ChevronDown size={18} /></summary><nav className="lesson-list" aria-label="課程單元">{course.lessons.map((item, itemIndex) => <a href={lessonHref(course, itemIndex)} key={item.title} className={itemIndex === index ? 'current' : ''} aria-current={itemIndex === index ? 'page' : undefined} onClick={() => onStart(course, itemIndex)}><span className="lesson-index">{state?.completed.includes(itemIndex) ? <Check size={16} /> : String(itemIndex + 1).padStart(2, '0')}</span><span>{item.title}</span></a>)}</nav></details>
    </aside>
    <article className="lesson-content">
      <div className="lesson-topline"><span>第 {String(index + 1).padStart(2, '0')} 課 / {String(course.lessons.length).padStart(2, '0')}</span><span>{chapter ? chapter.title : course.shortTitle}</span></div>
      <div className="lesson-article">
        {lesson.videoUrl ? <div className="lesson-video-wrap">{videoStarted ? <video key={`${course.slug}-${index}`} controls autoPlay playsInline preload="metadata" poster={assetPath(lesson.image || chapter?.image || '/images/luxkey-ziwei.webp')} src={lesson.videoUrl}>你的瀏覽器不支援影片播放。</video> : <button className="lesson-video-poster" type="button" style={{ backgroundImage: `linear-gradient(180deg, rgba(20,22,26,.02), rgba(20,22,26,.42)), url("${assetPath(lesson.image || chapter?.image || '/images/luxkey-ziwei.webp')}")` }} onClick={() => setVideoStarted(true)} aria-label={`播放第 ${index + 1} 課影片：${lesson.title}`}><span className="video-poster-top">第 {String(index + 1).padStart(2, '0')} 課</span><span className="video-poster-play"><Play size={23} fill="currentColor" /> 播放影片 · {videoTime(lesson.videoDuration)}</span></button>}<div className="lesson-video-caption"><span><Play size={16} /> 紫微宇宙課程影片 · {videoTime(lesson.videoDuration)}</span></div></div> : <figure className="lesson-reading-visual"><img src={assetPath(lesson.image || course.coverImage || originalCoverImages[course.slug])} alt={`${course.shortTitle}課程情境示意`} /><figcaption>課程情境示意</figcaption></figure>}
        <div className="lesson-heading"><div className="section-kicker">第 {String(index + 1).padStart(2, '0')} 課</div><h1>{lesson.title}</h1><details className="lesson-overview"><summary>閱讀本課簡介</summary><p>{annotatedText(lesson.summary, isZiwei ? index : undefined)}</p></details></div>
        <aside className="lesson-focus"><span>本課重點</span><strong>{isZiwei ? ziweiHighlights[index].focus : lesson.summary}</strong><small>{isZiwei && <><i className="highlight-swatch palace-swatch" /> 宮位　</>}<i className="highlight-swatch teaching-swatch" /> 原文關鍵句</small></aside>
        {lesson.sections.map((section, sectionIndex) => <section className="lesson-section" key={section.heading}>
          <div className="section-kicker">{String(sectionIndex + 1).padStart(2, '0')} / KEY IDEA</div>
          <h2>{annotatedText(section.heading, isZiwei ? index : undefined)}</h2>
          <div className="section-idea"><span>本段重點</span><p>{section.keyIdea}</p></div>
          {section.blocks ? section.blocks.map((block, blockIndex) => <LessonBlockContent key={blockIndex} block={block} lessonIndex={isZiwei ? index : undefined} keyIdea={section.keyIdea} />) : <p>{annotatedText(section.body, isZiwei ? index : undefined, section.keyIdea)}</p>}
        </section>)}
        <section className="exercise-box"><div className="section-kicker">GUIDED PRACTICE / 本課作業</div><h2>現在，換你試試。</h2><p>{isZiwei ? lessonActivities[index] : lesson.exercise}</p>{isZiwei && <label className="activity-field">你的作業內容<textarea value={activity} onChange={(event) => onActivity(index, event.target.value)} rows={5} placeholder="把你的計算過程、觀察或仍不確定的地方寫在這裡…" /><small>至少 12 字；自動儲存在此瀏覽器。命盤計算可用下方工具核對，文字作業尚無人工批改。</small></label>}</section>
        {isZiwei && <ZiweiChecker index={index} />}
        {isZiwei && chapterChecks[index] && <StageCheck index={index} state={state} onAnswer={onCheckAnswer} onPass={onCheckPass} />}
        {isZiwei && index === course.lessons.length - 1 && <Capstone state={state} onChange={onCapstoneChange} onSubmit={onCapstoneSubmit} />}
        {isZiwei && <p className="lesson-source-note">課程內容提供：紫微宇宙。紫微斗數可作自我探索；健康、法律或財務問題請諮詢相應專業人士。</p>}
        <section className="notes-block"><label htmlFor="lesson-notes">你的課堂筆記 <span>自動儲存在此瀏覽器</span></label><textarea id="lesson-notes" value={state?.notes[index] || ''} onChange={(event) => onNote(course.slug, index, event.target.value)} placeholder="寫下你的想法、問題或練習成果…" rows={6} /></section>
        <div className="lesson-actions"><button className={`btn ${done ? 'btn-complete' : 'btn-primary'}`} type="button" disabled={!canComplete} onClick={() => onComplete(course.slug, index)}>{done ? <CheckCircle2 size={19} /> : <Check size={19} />}{done ? '已完成本單元' : '完成本課練習'}</button>{index < course.lessons.length - 1 ? <a className="text-link" href={lessonHref(course, index + 1)} onClick={() => onStart(course, index + 1)}>下一單元 <ArrowRight size={19} /></a> : <a className="text-link" href="#/my-learning">回到我的學習 <ArrowRight size={19} /></a>}</div>
      </div>
      <div className="lesson-pager">{index > 0 ? <a href={lessonHref(course, index - 1)} onClick={() => onStart(course, index - 1)}><ChevronLeft size={19} /> 上一單元</a> : <span />}{index < course.lessons.length - 1 ? <a href={lessonHref(course, index + 1)} onClick={() => onStart(course, index + 1)}>下一單元 <ChevronRight size={19} /></a> : <span />}</div>
    </article>
  </div></main>
}

function MyLearning({ learning, onStart }: { learning: LearningState; onStart: (course: Course, index?: number) => void }) {
  const started = courses.filter((course) => learning[course.slug]?.started)
  return <main>
    <section className="page-hero library-hero"><div className="container"><div className="section-kicker">我的學習</div><h1>{started.length ? '接著，繼續學。' : '從一門課開始。'}</h1><p>{started.length ? `${started.length} 門正在學習的課程` : '挑一門感興趣的課，從第一步開始。'}</p></div></section>
    <section className="section library-section"><div className="container">{started.length ? <div className="library-grid">{started.map((course) => { const state = learning[course.slug]; const next = resumeLessonIndex(course, state); const percent = progressFor(course, state); return <div className="library-card" key={course.slug}><div className="library-card-media"><img src={assetPath(course.coverImage || originalCoverImages[course.slug])} alt="" loading="lazy" decoding="async" /></div><div className="library-card-content"><div className="card-meta">{course.number} / {course.category}</div><h2>{course.title}</h2><div className="progress-block"><div><span>學習進度</span><strong>{percent}%</strong></div><div className="progress-track" role="progressbar" aria-label={`${course.title} 完成進度`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div></div><button type="button" className="text-link" onClick={() => onStart(course, next)}>{percent === 100 ? '重新閱讀' : '繼續學習'} <ArrowRight size={18} /></button></div></div> })}</div> : <div className="empty-state"><BookOpen size={34} strokeWidth={1.5} /><h2>課程會出現在這裡。</h2><a className="btn btn-primary" href="#/explore">探索課程 <ArrowUpRight size={18} /></a></div>}</div></section>
  </main>
}

function PricingAdmin({ prices, onSaved }: { prices: CoursePrices; onSaved: (slug: string, price: CoursePrice) => void }) {
  const [drafts, setDrafts] = useState<CoursePrices>({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const update = (slug: string, change: Partial<CoursePrice>) => setDrafts((before) => ({ ...before, [slug]: { ...(before[slug] || prices[slug] || proposedCoursePrices[slug]), ...change } }))
  const save = async (slug: string) => {
    const price = drafts[slug] || prices[slug] || proposedCoursePrices[slug]
    if (!validCoursePrice(price)) { setMessage('請確認定價高於現在售價。'); return }
    if (!pricingApiUrl) { setMessage('Cloudflare 價格 API 尚未接上，無法儲存。'); return }
    setSaving(slug); setMessage('')
    try {
      const response = await fetch(`${pricingApiUrl.replace(/\/$/, '')}/admin/prices/${slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(price) })
      if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? '請先通過 Cloudflare Access 管理員驗證。' : `儲存失敗（${response.status}）。`)
      const saved = await response.json() as CoursePrice
      onSaved(slug, saved)
      setDrafts((before) => { const next = { ...before }; delete next[slug]; return next })
      setMessage(`${courses.find((course) => course.slug === slug)?.shortTitle}價格已儲存。`)
    } catch (error) { setMessage(error instanceof Error ? error.message : '儲存失敗。') }
    finally { setSaving(null) }
  }
  return <main className="container pricing-admin"><div className="section-kicker">ADMIN / COURSE PRICING</div><h1>課程價格管理</h1><p>目前管理定價與現在售價，金額皆為新台幣。</p>{!pricingApiUrl && <p className="admin-warning">Cloudflare 後台尚未串接。目前只能檢視價格規劃，不能儲存。</p>}{message && <p role="status" className="admin-warning">{message}</p>}
    <div className="pricing-admin-list">{courses.map((course) => { const price = drafts[course.slug] || prices[course.slug] || proposedCoursePrices[course.slug]; return <section className="pricing-admin-row" key={course.slug}><h2>{course.number}　{course.shortTitle}</h2><div className="pricing-admin-fields">
      <label>定價 <input type="number" min="1" step="1" value={price.listPrice} onChange={(event) => update(course.slug, { listPrice: Number(event.target.value) })} /></label>
      <label>現在售價 <input type="number" min="1" step="1" value={price.currentPrice} onChange={(event) => update(course.slug, { currentPrice: Number(event.target.value) })} /></label>
      <label>狀態 <select value={price.status} onChange={(event) => update(course.slug, { status: event.target.value as CoursePrice['status'] })}><option value="planned">規劃中</option><option value="live">已發布價格</option></select></label>
    </div><button type="button" className="btn btn-ink" disabled={!pricingApiUrl || saving !== null} onClick={() => void save(course.slug)}>{saving === course.slug ? '儲存中…' : '儲存價格'}</button></section> })}</div>
  </main>
}

export default function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const [learning, setLearning] = useState<LearningState>(readLearning)
  const [prices, setPrices] = useState<CoursePrices>(proposedCoursePrices)
  useEffect(() => {
    if (!pricingApiUrl) return
    const controller = new AbortController()
    fetch(`${pricingApiUrl.replace(/\/$/, '')}/prices`, { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error('價格 API 無法讀取')
      return response.json() as Promise<CoursePrices>
    }).then((records) => {
      const accepted = Object.fromEntries(Object.entries(records).filter(([slug, price]) => proposedCoursePrices[slug] && validCoursePrice(price)))
      setPrices({ ...proposedCoursePrices, ...accepted })
    }).catch(() => { /* Keep clearly labeled proposed prices when backend is offline. */ })
    return () => controller.abort()
  }, [])
  useEffect(() => {
    const update = () => { setRoute(readRoute()); window.scrollTo({ top: 0, behavior: 'instant' }) }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  useEffect(() => { localStorage.setItem('luxkey-learning-v1', JSON.stringify(learning)) }, [learning])

  const updateCourse = (slug: string, update: (state: CourseState) => CourseState) => setLearning((current) => {
    const previous = current[slug] || { started: true, completed: [], notes: {} }
    return { ...current, [slug]: update(previous) }
  })
  const onStart = (course: Course, index = 0) => {
    updateCourse(course.slug, (state) => ({ ...state, started: true }))
    window.location.hash = `/learn/${course.slug}/${index}`
  }
  const onComplete = (slug: string, index: number) => updateCourse(slug, (state) => ({ ...state, completed: state.completed.includes(index) ? state.completed : [...state.completed, index] }))
  const onNote = (slug: string, index: number, value: string) => updateCourse(slug, (state) => ({ ...state, notes: { ...state.notes, [index]: value } }))
  const onActivity = (index: number, value: string) => updateCourse(ziweiCourse.slug, (state) => ({ ...state, activities: { ...state.activities, [index]: value } }))
  const onCheckAnswer = (index: number, question: number, answer: number) => updateCourse(ziweiCourse.slug, (state) => {
    const answers = [...(state.checkAnswers?.[index] || [])]
    answers[question] = answer
    return { ...state, checkAnswers: { ...state.checkAnswers, [index]: answers } }
  })
  const onCheckPass = (index: number) => updateCourse(ziweiCourse.slug, (state) => ({ ...state, checkPassed: state.checkPassed?.includes(index) ? state.checkPassed : [...(state.checkPassed || []), index] }))
  const onCapstoneChange = (field: string, value: string) => updateCourse(ziweiCourse.slug, (state) => ({ ...state, capstone: { ...state.capstone, [field]: value }, capstoneSubmitted: false }))
  const onCapstoneSubmit = () => updateCourse(ziweiCourse.slug, (state) => ({ ...state, capstoneSubmitted: true }))

  const routeCourse = 'slug' in route ? courses.find((course) => course.slug === route.slug) : undefined
  const validLesson = route.page === 'lesson' && routeCourse && Number.isInteger(route.index) && route.index >= 0 && route.index < routeCourse.lessons.length
  let content
  if (route.page === 'home') content = <Home prices={prices} />
  else if (route.page === 'explore') content = <Explore learning={learning} prices={prices} />
  else if (route.page === 'pricing-admin') content = <PricingAdmin prices={prices} onSaved={(slug, price) => setPrices((current) => ({ ...current, [slug]: price }))} />
  else if (route.page === 'library') content = <MyLearning learning={learning} onStart={onStart} />
  else if (route.page === 'course' && routeCourse) content = <CourseDetail course={routeCourse} state={learning[routeCourse.slug]} onStart={onStart} prices={prices} />
  else if (route.page === 'lesson' && routeCourse && validLesson) content = <Learning course={routeCourse} index={route.index} state={learning[routeCourse.slug]} onComplete={onComplete} onNote={onNote} onActivity={onActivity} onCheckAnswer={onCheckAnswer} onCheckPass={onCheckPass} onCapstoneChange={onCapstoneChange} onCapstoneSubmit={onCapstoneSubmit} onStart={onStart} />
  else content = <main className="not-found container"><div className="section-kicker">404 / PAGE NOT FOUND</div><h1>這一頁，還沒寫好。</h1><a className="btn btn-primary" href="#/">回到首頁 <ArrowRight size={18} /></a></main>

  return <><Header route={route} />{content}<Footer /></>
}
