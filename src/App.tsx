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
import { activeCampaign, formatTwd, proposedCoursePrices, validCoursePrice, type CoursePrice } from './course-pricing'

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
      <div className="topline"><span>AI RICH 101 · LEARN TO EARN</span><span>100 種用 AI 賺錢的方法</span></div>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#/" aria-label="AI RICH 101 首頁">
            <span className="brand-name">AI RICH <em>101</em></span><span className="brand-sub">100 WAYS TO EARN WITH AI</span>
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
    <div><span className="brand-name footer-logo">AI RICH <em>101</em></span><p>100 種用 AI 賺錢的方法，從第一個可交付的作品開始。</p></div>
    <div className="footer-links"><a href="#/explore">探索課程</a><a href="#/my-learning">我的學習</a><a href="#/">回到首頁</a></div>
    <span className="footer-note">AI RICH 101 · 課程平台示範版</span>
  </div></footer>
}

const originalCoverImages: Record<string, string> = {
  'ziwei-foundations': '/images/luxkey-ziwei.webp',
  'tarot-practice': '/images/luxkey-tarot.webp',
}

function courseCoverStyle(course: Course) {
  if (course.coverImage) return {}
  const gradient = 'linear-gradient(90deg, rgba(255,255,255,.97), rgba(255,255,255,.08) 79%)'
  return { backgroundImage: `${gradient}, url("${assetPath(originalCoverImages[course.slug])}")` }
}

function Cover({ course, large = false }: { course: Course; large?: boolean }) {
  return <div className={`course-cover cover-${course.theme} cover-${course.slug} ${course.coverImage ? 'cover-localized' : ''} ${large ? 'cover-large' : ''}`} style={courseCoverStyle(course)} aria-hidden="true">
    {course.coverImage && <img className="course-cover-photo" src={assetPath(course.coverImage)} loading="lazy" decoding="async" alt="" />}
    <span className="cover-top">AI RICH 101 / CLASS <span>{course.number}</span></span>
    <div className="cover-rule" />
    <span className="cover-word">{course.coverWord.split(' / ').map((part, index) => <span key={part}>{part}{index === 0 && <br />}</span>)}</span>
    <div className="cover-bottom"><span>{course.category.toUpperCase()}</span><ArrowUpRight size={large ? 29 : 22} strokeWidth={1.7} /></div>
  </div>
}

function TuitionPrice({ price, compact = false }: { price: CoursePrice; compact?: boolean }) {
  const campaign = activeCampaign(price)
  return <div className={`tuition-price ${compact ? 'tuition-price-compact' : ''}`}>
    <span className="tuition-caption">課程價格 {price.status === 'planned' && <em>規劃中</em>}</span>
    <div><span>定價</span><s>{formatTwd(price.listPrice)}</s></div>
    <div className="tuition-current"><span>現在售價</span><strong>{formatTwd(price.currentPrice)}</strong></div>
    <div className={campaign ? 'tuition-campaign active' : 'tuition-campaign'}><span>活動價</span><b>{campaign ? formatTwd(price.campaignPrice!) : price.campaignPrice !== null ? '已排程／未生效' : '尚未設定'}</b></div>
  </div>
}

function CourseCard({ course, state, prices }: { course: Course; state?: CourseState; prices: CoursePrices }) {
  const percent = progressFor(course, state)
  const market = marketRates[course.slug]
  const price = prices[course.slug] || proposedCoursePrices[course.slug]
  return <a className="course-card" href={courseHref(course)}>
    <Cover course={course} />
    <div className="course-card-body">
      <div className="card-meta"><span>{course.category} / {course.level}</span><span>{course.duration}</span></div>
      <div className="course-status">{course.provider ? '20 堂完整課程' : '課綱示範 · 文字練習'}</div>
      <h3>{course.title}</h3><p>{course.subtitle}</p>
      <div className="course-pricing"><TuitionPrice price={price} compact /><div className="course-market"><span>{market.comparable ? '外部接案報價參考 · 非學費' : market.sourceUrl ? '相近服務公開報價 · 非學費' : '外部接案報價 · 非學費'}</span><strong>{market.price}<small>{market.unit}</small></strong></div></div>
      <div className="card-action"><span>{state?.started ? `${percent}% 已完成` : '查看課程'}</span><ArrowUpRight size={18} /></div>
    </div>
  </a>
}

function Home({ learning, prices }: { learning: LearningState; prices: CoursePrices }) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const recommended = courses.find((course) => course.slug === selectedGoal)
  const goals = [
    { slug: 'ziwei-foundations', label: '成為線上紫微命理師', tag: '線上諮詢' },
    { slug: 'tarot-practice', label: '把塔羅練習變成諮詢服務', tag: '線上諮詢' },
    { slug: 'website-building', label: '幫客戶做網站', tag: '網站接案' },
    { slug: 'social-graphic-editor', label: '接圖文小編的案子', tag: '內容接案' },
    { slug: 'ai-video-editing', label: '用 AI 幫客戶剪短片', tag: '影音接案' },
  ]
  return <main>
    <section className="hero-section" style={{ backgroundImage: `url("${assetPath('/images/luxkey-hero.webp')}")` }}><div className="container hero-grid">
      <div className="hero-copy">
        <div className="section-kicker"><span className="kicker-line" /> AI RICH 101 · LEARN TO EARN</div>
        <h1 className="hero-headline">建立你的一人公司，<br /><span>把技能變成第一筆收入</span></h1>
        <p className="hero-intro">100 種用 AI 賺錢的方法，先從一門可實作的課開始。首波 13 門，從線上諮詢、網站製作到影音與商家經營，練習接案需要的作品與流程。</p>
        <div className="hero-actions"><button type="button" className="btn btn-primary" onClick={() => document.getElementById('find-path')?.scrollIntoView({ behavior: 'smooth' })}>找到適合我的課 <ArrowUpRight size={19} /></button><a className="text-link" href="#/explore">探索所有課程 <ArrowRight size={18} /></a></div>
        <div className="hero-bottom"><span>01 / 13</span><div className="hairline" /><span>MAKE IT REAL</span></div>
      </div>
      <div className="hero-image-caption"><span>THE NEXT CHAPTER / 2026</span><span>IDEA → ACTION</span></div>
    </div></section>

    <section className="principles"><div className="container principles-grid">
      <span className="principles-label">為什麼在這裡學？</span>
      <p>知識，<em>要能用。</em></p>
      <span className="principles-caption">13 門首波課程 · 有作品的練習 · 參考服務定價</span>
    </div></section>

    <section className="spotlight-section"><div className="container spotlight-grid">
      <a className="spotlight-image" style={{ backgroundImage: `linear-gradient(90deg, rgba(255,255,255,.94), rgba(255,255,255,.06) 80%), url("${assetPath('/images/luxkey-ziwei.webp')}")` }} href={courseHref(ziweiCourse)} aria-label="查看紫微斗數入門課程"><span>第一門完整課程 / 紫微宇宙</span><strong>紫微斗數<br />入門</strong><span>20 堂課 · 6 個學習階段</span></a>
      <div className="spotlight-copy"><div className="section-kicker">第一門完整課 / 紫微宇宙</div><h2>從一張命盤，<br /><span>讀懂自己的節奏。</span></h2><p>20 堂紫微斗數入門課，分六個階段，從出生資料、手排命盤，一步步走到解讀與規劃。影片、課文、作業和檢核都在這裡。</p><div className="spotlight-facts"><span>20 堂完整課程</span><span>6 個學習階段</span><span>依自己的節奏開始</span></div><a className="btn btn-primary" href={courseHref(ziweiCourse)}>查看紫微入門課 <ArrowUpRight size={19} /></a></div>
    </div></section>

    <section className="path-section" id="find-path"><div className="container path-grid">
      <div className="path-intro"><div className="section-kicker">FIND YOUR NEXT STEP / 01</div><h2>賺錢方法很多，<br /><span>找到適合你的</span></h2><p>從眼前最想完成的事開始。我們會推薦一門可以立刻動手的課。</p><span className="path-small">想更了解自己？可以先<a href="https://www.ziweiuniverse.com/" target="_blank" rel="noopener noreferrer">算算紫微 <ArrowUpRight size={13} /></a></span></div>
      <div className="path-panel"><div className="path-panel-top"><span>CHOOSE YOUR DIRECTION</span><span>01 / 01</span></div><div className="path-options" role="group" aria-label="選擇學習目標">{goals.map((goal, index) => <button type="button" key={goal.slug} className={selectedGoal === goal.slug ? 'selected' : ''} aria-pressed={selectedGoal === goal.slug} onClick={() => setSelectedGoal(goal.slug)}><span className="path-option-number">{String(index + 1).padStart(2, '0')}</span><span>{goal.label}<small>{goal.tag}</small></span><ArrowUpRight size={20} /></button>)}</div>{recommended ? <div className="path-result" aria-live="polite"><span>你的推薦課程</span><strong>{recommended.title}</strong><p>{recommended.subtitle}</p><a href={courseHref(recommended)}>查看課程內容 <ArrowRight size={18} /></a></div> : <div className="path-prompt">選擇一個方向，看見你的第一步。<ArrowRight size={18} /></div>}</div>
    </div></section>

    <section className="section courses-section"><div className="container">
      <div className="section-heading"><div><div className="section-kicker">01 / 精選課程</div><h2>從一門課，<br />做出第一個服務。</h2></div><a href="#/explore" className="text-link">探索全部課程 <ArrowUpRight size={18} /></a></div>
      <div className="course-grid">{courses.slice(0, 6).map((course) => <CourseCard key={course.slug} course={course} state={learning[course.slug]} prices={prices} />)}</div><p className="course-price-note">畫面上的定價與現在售價是完整課程的價格規劃，目前可公開試學、尚未開放購買；活動價尚未設定。外部接案報價是不同服務的公開資料，與學費無關，也不是收入保證。</p>
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

function Explore({ learning, prices }: { learning: LearningState; prices: CoursePrices }) {
  const [category, setCategory] = useState('全部')
  const [query, setQuery] = useState('')
  const results = useMemo(() => courses.filter((course) => {
    const matchesCategory = category === '全部' || course.category === category
    const text = `${course.title} ${course.shortTitle} ${course.subtitle} ${course.description} ${course.category}`.toLowerCase()
    return matchesCategory && text.includes(query.trim().toLowerCase())
  }), [category, query])
  return <main>
    <section className="page-hero explore-hero"><div className="container"><div className="section-kicker">THE COURSE LIBRARY / 01—13</div><h1>原來沒這麼難</h1><p>首波 13 門課。選一個想做的服務，先收到第一個1000元。</p></div></section>
    <section className="section catalog-section"><div className="container">
      <div className="catalog-tools"><div className="category-list" aria-label="課程分類">{categories.map((item) => <button type="button" key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-box"><Search size={20} strokeWidth={2} /><span className="sr-only">搜尋課程</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋你想學的主題" /></label></div>
      <div className="results-line"><span>{String(results.length).padStart(2, '0')} 門課程</span><span>依主題探索</span></div><p className="catalog-disclaimer">定價、現在售價為未來完整課程的價格規劃；目前可公開試學，尚未開放購買。活動價由後台設定，目前均未啟用。外部接案報價不是學費或收入保證。紫微課已有 20 堂內容；其他課程目前為文字實作版。</p>
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
  const [openChapter, setOpenChapter] = useState(0)
  useEffect(() => setOpenChapter(0), [course.slug])
  return <main>
    <section className="detail-top"><div className="container"><a className="back-link" href="#/explore"><ArrowLeft size={17} /> 返回所有課程</a></div></section>
    <section className={`detail-hero ${course.provider ? 'detail-hero-featured' : ''}`}><div className="container detail-grid">
      <div className="detail-copy"><div className="section-kicker">{course.category} / {course.level} / CLASS {course.number}</div><h1>{course.title}</h1><p className="detail-subtitle">{course.subtitle}</p><div className="detail-meta"><span><BookOpen size={18} /> {course.lessons.length} {course.provider ? '堂課' : '個單元'}</span><span><Clock3 size={18} /> {course.duration}</span>{course.provider && <span><Play size={18} /> {course.lessons.length} 支影片</span>}</div><p className="detail-description">{course.description}</p><div className="detail-pricing">
        <div className="detail-tuition"><TuitionPrice price={price} /><p>完整課程價格規劃；目前可公開試學，尚未開放購買。<a href="https://github.com/VitoKOK-lab/101-Ways-to-Get-Rich-Using-AI/blob/main/docs/course-tuition-benchmark.md" target="_blank" rel="noopener noreferrer">查看學費調查依據</a></p></div>
        <div className="detail-market"><span>{market.comparable ? '台灣外部接案報價參考' : market.sourceUrl ? '台灣相近服務公開報價' : '外部接案報價'}</span><strong>{market.price}<small>{market.unit}</small></strong><p>{market.scope} 這是外部服務報價，並非本課學費或學員收入保證。</p>{market.sourceUrl && <a href={market.sourceUrl} target="_blank" rel="noopener noreferrer">資料來源：{market.sourceName} <ArrowUpRight size={14} /></a>}</div>
      </div>{course.aiUse && <p className="detail-ai"><strong>AI 在這門課怎麼用</strong>{course.aiUse}</p>}{course.provider && <p className="detail-prep"><strong>課前準備</strong> 出生年月日與時辰、紙筆；每次安排 20–30 分鐘，完成一小步即可。</p>}<button type="button" className="btn btn-primary" onClick={() => onStart(course, resumeIndex)}>{state?.started ? '繼續學習' : '開始這堂課'} <ArrowUpRight size={20} /></button><span className="detail-aside">{course.provider ? `課程內容提供：${course.provider}` : '課綱示範 · 目前提供文字導讀與練習，尚無講師影片'}</span>{state?.started && <span className="detail-progress">已完成 {percent}%</span>}</div>
      <Cover course={course} large />
    </div></section>
    <section className="section outcomes-section"><div className="container outcomes-grid"><div><div className="section-kicker">01 / WHAT YOU WILL DO</div><h2>學完後，<br />你能做到。</h2></div><ol>{course.outcomes.map((outcome, index) => <li key={outcome}><span>{String(index + 1).padStart(2, '0')}</span><p>{outcome}</p><Check size={19} /></li>)}</ol></div></section>
    <section className="section syllabus-section" id="lesson-plan"><div className="container"><div className="section-heading"><div><div className="section-kicker">02 / LEARNING PATH</div><h2>課程路線</h2></div><span className="syllabus-count">{course.lessons.length} 堂課 / {course.duration}</span></div>{course.chapters && <div className="module-grid" aria-label="六個學習階段">{chapters.map((chapter, chapterIndex) => <button className="module-card" type="button" key={chapter.title} onClick={() => { setOpenChapter(chapterIndex); document.getElementById('full-plan')?.scrollIntoView({ behavior: 'smooth' }) }}><span className="module-image" style={{ backgroundImage: `url("${assetPath(chapter.image)}")` }} /><span className="module-meta">階段 {String(chapterIndex + 1).padStart(2, '0')} · {chapter.end - chapter.start + 1} 堂課</span><strong>{chapter.title}</strong><small>{chapter.goal}</small></button>)}</div>}<div className="lesson-plan-head" id="full-plan"><div><span className="section-kicker">完整課表</span><h3>依自己的節奏，逐堂完成。</h3></div><span>{course.chapters ? '選一個階段，查看課次' : '點選課次開始'}</span></div>{chapters.map((chapter, chapterIndex) => <div className="syllabus-chapter" key={chapter.title || 'all'}>{chapter.title && <button className="syllabus-chapter-title" type="button" aria-expanded={openChapter === chapterIndex} onClick={() => setOpenChapter(openChapter === chapterIndex ? -1 : chapterIndex)}><span>PART {String(chapterIndex + 1).padStart(2, '0')}</span><h3>{chapter.title}</h3><small>{String(chapter.end - chapter.start + 1).padStart(2, '0')} LESSONS</small><ChevronDown size={20} /></button>}{(!course.chapters || openChapter === chapterIndex) && <>{chapter.goal && <p className="chapter-goal">這一階段完成：{chapter.goal}</p>}<div className="syllabus-list">{course.lessons.slice(chapter.start, chapter.end + 1).map((lesson, offset) => { const index = chapter.start + offset; return <button type="button" key={lesson.title} onClick={() => onStart(course, index)}>{course.provider ? <span className="syllabus-thumb" style={{ backgroundImage: `url("${assetPath(chapter.image)}")` }}><span>{String(index + 1).padStart(2, '0')}</span></span> : <span className="syllabus-number">{String(index + 1).padStart(2, '0')}</span>}<span className="syllabus-content"><strong>{lesson.title}</strong>{!course.provider && <small>{lesson.summary}</small>}</span><span className="syllabus-time">{lesson.videoUrl ? `${videoTime(lesson.videoDuration)} 影片` : lesson.time}</span><Play size={18} /></button> })}</div></>}</div>)}</div></section>
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
  const lessonNavRef = useRef<HTMLElement>(null)
  const [videoStarted, setVideoStarted] = useState(false)
  useEffect(() => setVideoStarted(false), [course.slug, index])
  const isZiwei = course.slug === ziweiCourse.slug
  const activity = state?.activities?.[index] || ''
  const canComplete = !isZiwei || activity.trim().length >= 12
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
      <div className="sidebar-foot">AI RICH 101 / MAKE IT REAL</div>
    </aside>
    <article className="lesson-content">
      <div className="lesson-topline"><span>單元 {String(index + 1).padStart(2, '0')} / {String(course.lessons.length).padStart(2, '0')}</span><span>{chapter ? chapter.title : '文字導讀'} · {lesson.time}</span></div>
      <div className="lesson-article">
        <div className="section-kicker">THE LESSON / {course.number}.{String(index + 1).padStart(2, '0')}</div>
        <h1>{lesson.title}</h1><p className="lesson-lead">{annotatedText(lesson.summary, isZiwei ? index : undefined)}</p>
        {lesson.videoUrl && <div className="lesson-video-wrap">{videoStarted ? <video key={`${course.slug}-${index}`} controls autoPlay playsInline preload="metadata" poster={assetPath(chapter?.image || '/images/luxkey-ziwei.webp')} src={lesson.videoUrl}>你的瀏覽器不支援影片播放。</video> : <button className="lesson-video-poster" type="button" style={{ backgroundImage: `linear-gradient(90deg, rgba(255,255,255,.96), rgba(255,255,255,.12) 80%), url("${assetPath(chapter?.image || '/images/luxkey-ziwei.webp')}")` }} onClick={() => setVideoStarted(true)} aria-label={`播放第 ${index + 1} 課影片：${lesson.title}`}><span className="video-poster-top">紫微斗數入門 · 第 {String(index + 1).padStart(2, '0')} 課</span><strong>{lesson.title}</strong><span className="video-poster-play"><Play size={23} fill="currentColor" /> 播放影片 · {videoTime(lesson.videoDuration)}</span></button>}<div className="lesson-video-caption"><span><Play size={16} /> 紫微宇宙課程影片 · {videoTime(lesson.videoDuration)}</span><span>影片、課文、練習都在本站完成</span></div></div>}
        <div className="reader-notice"><BookOpen size={22} /><div><strong>{lesson.videoUrl ? '看影片、讀課文，然後動手排盤。' : '先讀，再動手。'}</strong><span>{lesson.videoUrl ? '完成下方實作、核對命盤，並在階段結尾參加測驗。' : '這是示範版課堂。閱讀重點後，完成下面的小練習。'}</span></div></div>
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
  return <main><section className="page-hero library-hero"><div className="container"><div className="section-kicker">MY LEARNING / YOUR PACE</div><h1>繼續往前，<br /><span>一步一步。</span></h1><p>你開始的課，都在這裡。</p></div></section><section className="section library-section"><div className="container"><div className="section-heading"><div><div className="section-kicker">學習記錄</div><h2>正在學習</h2></div><span>{String(started.length).padStart(2, '0')} 門課程</span></div>{started.length ? <div className="library-grid">{started.map((course) => { const state = learning[course.slug]; const next = resumeLessonIndex(course, state); const percent = progressFor(course, state); return <div className="library-card" key={course.slug}><Cover course={course} /><div className="library-card-content"><div className="card-meta">{course.category} / {course.lessons.length} 個單元</div><h3>{course.title}</h3><div className="progress-block"><div><span>已完成</span><strong>{percent}%</strong></div><div className="progress-track" role="progressbar" aria-label={`${course.title} 完成進度`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div></div><button type="button" className="text-link" onClick={() => onStart(course, next)}>{percent === 100 ? '重新閱讀' : '繼續學習'} <ArrowRight size={18} /></button></div></div> })}</div> : <div className="empty-state"><BookOpen size={34} strokeWidth={1.5} /><h2>你的下一步，從這裡開始。</h2><p>選一門現在最用得上的課，學習記錄就會出現在這裡。</p><a className="btn btn-primary" href="#/explore">探索課程 <ArrowUpRight size={18} /></a></div>}</div></section></main>
}

function PricingAdmin({ prices, onSaved }: { prices: CoursePrices; onSaved: (slug: string, price: CoursePrice) => void }) {
  const [drafts, setDrafts] = useState<CoursePrices>({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const update = (slug: string, change: Partial<CoursePrice>) => setDrafts((before) => ({ ...before, [slug]: { ...(before[slug] || prices[slug] || proposedCoursePrices[slug]), ...change } }))
  const save = async (slug: string) => {
    const price = drafts[slug] || prices[slug] || proposedCoursePrices[slug]
    if (!validCoursePrice(price)) { setMessage('請確認定價高於現在售價、活動價低於現在售價，並填妥活動起訖時間。'); return }
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
  const localDate = (value: string | null) => value ? new Date(value).toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).replace(' ', 'T').slice(0, 16) : ''
  return <main className="container pricing-admin"><div className="section-kicker">ADMIN / COURSE PRICING</div><h1>課程價格管理</h1><p>活動價僅在設定的期間生效；沒有活動時使用現在售價。所有價格都是新台幣。</p>{!pricingApiUrl && <p className="admin-warning">Cloudflare 後台尚未串接。目前只能檢視價格規劃，不能儲存。</p>}{message && <p role="status" className="admin-warning">{message}</p>}
    <div className="pricing-admin-list">{courses.map((course) => { const price = drafts[course.slug] || prices[course.slug] || proposedCoursePrices[course.slug]; return <section className="pricing-admin-row" key={course.slug}><h2>{course.number}　{course.shortTitle}</h2><div className="pricing-admin-fields">
      <label>定價 <input type="number" min="1" step="1" value={price.listPrice} onChange={(event) => update(course.slug, { listPrice: Number(event.target.value) })} /></label>
      <label>現在售價 <input type="number" min="1" step="1" value={price.currentPrice} onChange={(event) => update(course.slug, { currentPrice: Number(event.target.value) })} /></label>
      <label>活動價 <input type="number" min="1" step="1" value={price.campaignPrice ?? ''} placeholder="未設定" onChange={(event) => update(course.slug, { campaignPrice: event.target.value ? Number(event.target.value) : null, ...(!event.target.value ? { campaignStartsAt: null, campaignEndsAt: null } : {}) })} /></label>
      <label>活動開始（台北時間） <input type="datetime-local" value={localDate(price.campaignStartsAt)} onChange={(event) => update(course.slug, { campaignStartsAt: event.target.value ? new Date(`${event.target.value}:00+08:00`).toISOString() : null })} /></label>
      <label>活動結束（台北時間） <input type="datetime-local" value={localDate(price.campaignEndsAt)} onChange={(event) => update(course.slug, { campaignEndsAt: event.target.value ? new Date(`${event.target.value}:00+08:00`).toISOString() : null })} /></label>
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
  if (route.page === 'home') content = <Home learning={learning} prices={prices} />
  else if (route.page === 'explore') content = <Explore learning={learning} prices={prices} />
  else if (route.page === 'pricing-admin') content = <PricingAdmin prices={prices} onSaved={(slug, price) => setPrices((current) => ({ ...current, [slug]: price }))} />
  else if (route.page === 'library') content = <MyLearning learning={learning} onStart={onStart} />
  else if (route.page === 'course' && routeCourse) content = <CourseDetail course={routeCourse} state={learning[routeCourse.slug]} onStart={onStart} prices={prices} />
  else if (route.page === 'lesson' && routeCourse && validLesson) content = <Learning course={routeCourse} index={route.index} state={learning[routeCourse.slug]} onComplete={onComplete} onNote={onNote} onActivity={onActivity} onCheckAnswer={onCheckAnswer} onCheckPass={onCheckPass} onCapstoneChange={onCapstoneChange} onCapstoneSubmit={onCapstoneSubmit} onStart={onStart} />
  else content = <main className="not-found container"><div className="section-kicker">404 / PAGE NOT FOUND</div><h1>這一頁，還沒寫好。</h1><a className="btn btn-primary" href="#/">回到首頁 <ArrowRight size={18} /></a></main>

  return <><Header route={route} />{content}<Footer /></>
}
