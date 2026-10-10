import { readFileSync } from 'node:fs'

const lessons = JSON.parse(readFileSync(new URL('../src/ziwei-lessons.json', import.meta.url)))
const ideas = JSON.parse(readFileSync(new URL('../src/ziwei-key-ideas.json', import.meta.url)))
const courseFocuses = readFileSync(new URL('../src/ziwei-highlights.ts', import.meta.url), 'utf8').match(/\{ focus:/g) || []
const checker = readFileSync(new URL('../src/ziwei/check.js', import.meta.url), 'utf8')
const errors = []
let count = 0

if (lessons.length !== 20 || ideas.length !== lessons.length) errors.push('紫微課必須保有 20 堂課及對應的重點資料。')
if (courseFocuses.length !== lessons.length) errors.push('每堂紫微課都必須有「本課重點」。')
if (checker.includes('左右滑動看完整命盤')) errors.push('本站命盤工具仍有已移除的舊操作提示。')
for (const [lessonIndex, lesson] of lessons.entries()) {
  const copiedCopy = JSON.stringify(lesson)
  for (const phrase of ['左右滑動看完整命盤', '首頁的命盤', '首頁命盤', '首頁排出來的盤', '主題報告', '貴人報告', '戀愛腦報告', '正緣報告', '換工作報告', '婚期報告', '財路報告', '第一個百萬報告']) {
    if (copiedCopy.includes(phrase)) errors.push(`第 ${lessonIndex + 1} 課仍有舊站提示或未提供的功能：${phrase}`)
  }
  const annotations = ideas[lessonIndex] || []
  if (annotations.length !== lesson.sections.length) errors.push(`第 ${lessonIndex + 1} 課的 KEY IDEA 數量不符。`)
  for (const [sectionIndex, section] of lesson.sections.entries()) {
    const annotation = annotations[sectionIndex]
    if (!annotation) continue
    count++
    if (annotation.heading !== section.heading) errors.push(`第 ${lessonIndex + 1} 課第 ${sectionIndex + 1} 段標題已變動，請重新校對重點。`)
    const originalTexts = section.blocks?.filter((block) => ['paragraph', 'listItem'].includes(block.type)).map((block) => block.text || '') || [section.body]
    if (!annotation.quote?.trim() || !originalTexts.some((text) => text.includes(annotation.quote))) errors.push(`第 ${lessonIndex + 1} 課第 ${sectionIndex + 1} 段的關鍵句不在原課文內。`)
  }
}
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`已確認 ${lessons.length} 堂紫微課、${count} 段 KEY IDEA：每段重點均對應原課文。`)
