import { createContext, useContext } from 'react'

export type Lang = 'zh' | 'en'

export interface Dict {
  [key: string]: string
}

/**
 * Every user-visible string lives here. Nothing is hard-coded in components,
 * so the language switch covers every screen — not only the homepage.
 */
const zh: Dict = {
  'brand.name': '互联网时光机',
  'brand.nameEn': 'Internet Time Machine',
  'brand.slogan': '互联网从未真正遗忘。',
  'brand.tagline': '输入任意网址，回到它的过去。',

  'nav.home': '首页',
  'nav.explore': '历史检索',
  'nav.eras': '年代探索',
  'nav.compare': '历史对比',
  'nav.about': '关于',
  'nav.random': '随机穿越',
  'nav.langToggle': '切换到 English',
  'nav.menu': '菜单',
  'nav.close': '关闭',

  'author.label': '作者',
  'author.follow': '关注作者',

  'hero.kicker': 'WEB ARCHIVE EXPLORER · 1996 — 2026',
  'hero.title1': '互联网',
  'hero.title2': '从未遗忘',
  'hero.lead':
    '每一个网站都有一部年表。输入域名，我们把三十年的存档摊开在你面前——真实的、可点击的、来自 Internet Archive 的历史快照。',
  'hero.accentNote': '所有数据实时来自 Internet Archive Wayback Machine，不含任何伪造截图。',

  'search.placeholder': '输入网址，例如 google.com',
  'search.button': '开始穿越',
  'search.searching': '正在检索…',
  'search.hint': '支持域名、带协议头的网址与子路径。',
  'search.clear': '清空',

  'error.empty': '请输入一个网址。',
  'error.private': '无法查询内网或本地地址。',
  'error.bad-host': '这不是一个有效的域名。',
  'error.bad-url': '网址格式不正确。',
  'error.timeout': 'Internet Archive 响应超时，请重试。',
  'error.rate-limit': '请求过于频繁，请稍后再试。',
  'error.server': '存档服务暂时不可用，请稍后重试。',
  'error.offline': '网络已断开，请检查连接。',
  'error.bad-response': '存档服务返回了无法解析的结果。',
  'error.no-proxy': '此部署尚未配置存档代理，无法在浏览器中直接查询 CDX 接口。',
  'error.aborted': '请求已取消。',
  'error.unknown': '发生未知错误。',
  'error.retry': '重试',
  'error.none': '这个网站在 Internet Archive 中没有可用的历史存档。',
  'error.noneHint': '它可能从未被爬取，或者使用了 robots.txt 排除了存档。',

  'loading.archive': '正在读取存档索引…',
  'loading.detail': '正在解析快照分布…',

  'home.featured': '精选网站',
  'home.featuredLead': '这些网站的存档足够深，可以真正看出设计史。',
  'home.featuredAll': '查看全部',
  'home.randomTitle': '不知道从哪开始？',
  'home.randomLead': '交给随机数。我们会在有真实存档的站点里替你掷一次骰子。',
  'home.randomCta': '随机穿越一次',
  'home.erasTitle': '按年代探索',
  'home.erasLead': '从灰底蓝链到对话式界面，六个阶段，三十年。',
  'home.statsSites': '精选站点',
  'home.statsYears': '覆盖年份',
  'home.statsSource': '数据来源',
  'home.howTitle': '它如何工作',
  'home.how1Title': '输入域名',
  'home.how1Body': '我们把你输入的地址规范化，剔除协议、端口与追踪参数。',
  'home.how2Title': '查询 CDX 索引',
  'home.how2Body': '向 Internet Archive 的 CDX Server 逐年请求真实存档日期。',
  'home.how3Title': '打开原始快照',
  'home.how3Body': '快照直接在 Wayback Machine 上渲染，我们从不伪造页面。',

  'explore.title': '历史检索结果',
  'explore.for': '检索目标',
  'explore.earliest': '最早存档',
  'explore.latest': '最新存档',
  'explore.totalDays': '存档日期数',
  'explore.span': '跨越年份',
  'explore.coverage': '逐年覆盖',
  'explore.coverageLead': '每一格代表一年，亮度代表该年存档日期数量。点击进入详情。',
  'explore.openSite': '查看完整时间轴',
  'explore.noData': '暂无数据',
  'explore.year': '年',
  'explore.days': '天',
  'explore.source': '数据来源：Internet Archive CDX Server',
  'explore.partial': '部分年份查询失败，已标注为未验证。',
  'explore.resolved': '已解析',

  'site.timeline': '交互式时间轴',
  'site.timelineLead': '拖动、点击、或用方向键在年份之间移动。只有真实存在存档的年份才会亮起。',
  'site.prevYear': '上一年',
  'site.nextYear': '下一年',
  'site.oldest': '最早',
  'site.newest': '最新',
  'site.jumpOldest': '跳到最早版本',
  'site.jumpNewest': '跳到最新版本',
  'site.pickDate': '选择这一年的存档日期',
  'site.openSnapshot': '打开快照',
  'site.daysInYear': '本年度存档日期',
  'site.noYearData': '这一年没有可用存档。',
  'site.yearFailed': '这一年查询失败，请重试。',
  'site.reload': '重新加载这一年',
  'site.snapshotList': '快照列表',
  'site.firstOfYear': '年初',
  'site.lastOfYear': '年末',
  'site.shareTitle': '分享这个时间点',
  'site.copyLink': '复制链接',
  'site.copied': '已复制',
  'site.shareX': '分享到 X',

  'snapshot.title': '历史快照浏览',
  'snapshot.domain': '网站',
  'snapshot.date': '快照日期',
  'snapshot.year': '历史年份',
  'snapshot.prev': '上一个快照',
  'snapshot.next': '下一个快照',
  'snapshot.back': '返回时间轴',
  'snapshot.openArchive': '在 Internet Archive 打开',
  'snapshot.raw': '打开原始文档（无工具栏）',
  'snapshot.embedFailedTitle': '这个快照无法内嵌显示',
  'snapshot.embedFailedBody':
    '部分网站通过 X-Frame-Options、CSP 或脚本改写阻止被嵌入。这不是存档缺失——快照本身仍然可用。',
  'snapshot.embedFailedCta': '在新窗口打开快照',
  'snapshot.reload': '重新载入',
  'snapshot.notice': '快照由 Internet Archive 提供，本站不修改其内容。',
  'snapshot.missingParams': '缺少快照参数。',
  'snapshot.toolbarTip': '提示：Wayback 工具栏中的日期可以跳转到相邻存档。',

  'compare.title': '历史对比',
  'compare.lead': '并排查看同一个网站的两个年代。两边都是真实的 Wayback 快照。',
  'compare.domain': '网站域名',
  'compare.left': '左侧版本',
  'compare.right': '右侧版本',
  'compare.year': '年份',
  'compare.month': '月份（可选）',
  'compare.any': '任意',
  'compare.run': '开始对比',
  'compare.sync': '同步缩放',
  'compare.openBoth': '同时在新窗口打开',
  'compare.noSnapshot': '该时间点没有找到存档。',
  'compare.pickYear': '请选择两个年份。',
  'compare.sameYear': '两个版本选择了同一年。',
  'compare.embedded': '内嵌预览',
  'compare.externalHint': '如内嵌失败，请使用“在 Internet Archive 打开”。',

  'eras.title': '年代探索',
  'eras.lead': '互联网不是线性进化的。每一个阶段都留下了自己的视觉方言。',
  'eras.range': '时间范围',
  'eras.summary': '时代概述',
  'eras.milestones': '关键节点',
  'eras.representative': '代表网站',
  'eras.explore': '探索',
  'eras.source': '来源',

  'about.title': '关于项目',
  'about.intro':
    '互联网时光机是一个用于探索网页历史的开源工具。它不存储网页，也不生成截图——它把你的查询转成一个精确的 CDX 请求，然后把 Internet Archive 已经保存的东西原样呈现。',
  'about.dataTitle': '数据来源与边界',
  'about.dataBody':
    '所有历史数据来自 Internet Archive 的 CDX Server 与 Wayback Machine。我们只做三件事：规范输入、聚合按年索引、把快照地址拼对。',
  'about.limitsTitle': '已知限制',
  'about.limits1': 'CDX 接口不返回跨域头，因此本项目带一个只放行 http/https 主机的极薄代理。',
  'about.limits2': '部分快照拒绝被 iframe 嵌入，此时我们提供外部打开入口，而不是伪造预览。',
  'about.limits3': '逐年查询对超大站点耗时较长；失败年份会显式标注为未验证。',
  'about.limits4': 'Internet Archive 有速率限制，密集查询可能被短暂拒绝。',
  'about.stackTitle': '技术栈',
  'about.stackBody': 'React 19 + TypeScript + Vite + Tailwind CSS，配 Cloudflare Pages Functions 代理。',
  'about.privacyTitle': '隐私',
  'about.privacyBody': '没有账号、没有 Cookie 跟踪、没有第三方分析脚本。你的查询只发往 Internet Archive。',
  'about.authorTitle': '作者',
  'about.licenseTitle': '许可证',
  'about.licenseBody': 'MIT License。可自由使用、修改与分发。',
  'about.thanks': '感谢 Internet Archive——没有它，这个项目无从谈起。',

  'notFound.title': '404 · 页面走丢了',
  'notFound.body': '这个地址没有对应的页面。也许它属于另一个年代。',
  'notFound.cta': '回到首页',

  'footer.tagline': 'The Internet Never Forgets.',
  'footer.builtWith': '数据来自 Internet Archive · 以 MIT 许可证开源',
  'footer.source': '源代码',
  'footer.archive': 'Internet Archive',
  'footer.terms': '使用条款',

  'common.back': '返回',
  'common.retry': '重试',
  'common.loading': '加载中…',
  'common.close': '关闭',
  'common.copy': '复制',
  'common.copied': '已复制',
}

const en: Dict = {
  'brand.name': 'Internet Time Machine',
  'brand.nameEn': '互联网时光机',
  'brand.slogan': 'The Internet Never Forgets.',
  'brand.tagline': 'Enter any URL. Travel to its past.',

  'nav.home': 'Home',
  'nav.explore': 'Search',
  'nav.eras': 'Eras',
  'nav.compare': 'Compare',
  'nav.about': 'About',
  'nav.random': 'Random',
  'nav.langToggle': '切换到中文',
  'nav.menu': 'Menu',
  'nav.close': 'Close',

  'author.label': 'Author',
  'author.follow': 'Follow the author',

  'hero.kicker': 'WEB ARCHIVE EXPLORER · 1996 — 2026',
  'hero.title1': 'THE INTERNET',
  'hero.title2': 'NEVER FORGETS',
  'hero.lead':
    'Every website has a chronology. Enter a domain and we lay thirty years of archives in front of you — real, clickable snapshots from the Internet Archive.',
  'hero.accentNote': 'All data is fetched live from the Internet Archive Wayback Machine. No fabricated screenshots, ever.',

  'search.placeholder': 'Enter a URL, e.g. google.com',
  'search.button': 'Time travel',
  'search.searching': 'Searching…',
  'search.hint': 'Domains, full URLs with a scheme, and sub-paths all work.',
  'search.clear': 'Clear',

  'error.empty': 'Please enter a URL.',
  'error.private': 'Private and local addresses cannot be queried.',
  'error.bad-host': 'That is not a valid domain.',
  'error.bad-url': 'That URL is not formed correctly.',
  'error.timeout': 'The Internet Archive timed out. Please retry.',
  'error.rate-limit': 'Too many requests. Please slow down.',
  'error.server': 'The archive service is temporarily unavailable.',
  'error.offline': 'You appear to be offline.',
  'error.bad-response': 'The archive service returned something unparseable.',
  'error.no-proxy': 'This deployment has no archive proxy configured, so CDX cannot be queried from the browser.',
  'error.aborted': 'Request cancelled.',
  'error.unknown': 'An unknown error occurred.',
  'error.retry': 'Retry',
  'error.none': 'No archived snapshots exist for this site.',
  'error.noneHint': 'It may never have been crawled, or robots.txt excluded it.',

  'loading.archive': 'Reading the archive index…',
  'loading.detail': 'Resolving snapshot distribution…',

  'home.featured': 'Featured sites',
  'home.featuredLead': 'These archives run deep enough to actually read design history from.',
  'home.featuredAll': 'See all',
  'home.randomTitle': 'Not sure where to start?',
  'home.randomLead': 'Let the dice decide. We roll among sites that are known to have real archives.',
  'home.randomCta': 'Random trip',
  'home.erasTitle': 'Explore by era',
  'home.erasLead': 'From grey backgrounds and blue links to conversational interfaces. Six phases, three decades.',
  'home.statsSites': 'Curated sites',
  'home.statsYears': 'Years covered',
  'home.statsSource': 'Data source',
  'home.howTitle': 'How it works',
  'home.how1Title': 'Enter a domain',
  'home.how1Body': 'We normalise the address and drop the scheme, port and tracking parameters.',
  'home.how2Title': 'Query the CDX index',
  'home.how2Body': 'We ask the Internet Archive CDX Server for real snapshot dates, year by year.',
  'home.how3Title': 'Open the real snapshot',
  'home.how3Body': 'Snapshots render directly on the Wayback Machine. We never fake a page.',

  'explore.title': 'Search results',
  'explore.for': 'Target',
  'explore.earliest': 'Earliest snapshot',
  'explore.latest': 'Latest snapshot',
  'explore.totalDays': 'Archived days',
  'explore.span': 'Years spanned',
  'explore.coverage': 'Yearly coverage',
  'explore.coverageLead': 'One cell per year; brightness encodes how many distinct archived days it has. Click to open the timeline.',
  'explore.openSite': 'Open full timeline',
  'explore.noData': 'No data',
  'explore.year': 'year',
  'explore.days': 'days',
  'explore.source': 'Source: Internet Archive CDX Server',
  'explore.partial': 'Some years failed to resolve and are marked unverified.',
  'explore.resolved': 'resolved',

  'site.timeline': 'Interactive timeline',
  'site.timelineLead': 'Drag, click, or use the arrow keys to move between years. Only years with real archives light up.',
  'site.prevYear': 'Previous year',
  'site.nextYear': 'Next year',
  'site.oldest': 'Oldest',
  'site.newest': 'Newest',
  'site.jumpOldest': 'Jump to oldest',
  'site.jumpNewest': 'Jump to newest',
  'site.pickDate': 'Pick an archived day in this year',
  'site.openSnapshot': 'Open snapshot',
  'site.daysInYear': 'Archived days this year',
  'site.noYearData': 'No archive for this year.',
  'site.yearFailed': 'This year failed to load. Please retry.',
  'site.reload': 'Reload this year',
  'site.snapshotList': 'Snapshot list',
  'site.firstOfYear': 'Start of year',
  'site.lastOfYear': 'End of year',
  'site.shareTitle': 'Share this moment',
  'site.copyLink': 'Copy link',
  'site.copied': 'Copied',
  'site.shareX': 'Share on X',

  'snapshot.title': 'Snapshot viewer',
  'snapshot.domain': 'Site',
  'snapshot.date': 'Snapshot date',
  'snapshot.year': 'Year',
  'snapshot.prev': 'Previous snapshot',
  'snapshot.next': 'Next snapshot',
  'snapshot.back': 'Back to timeline',
  'snapshot.openArchive': 'Open on Internet Archive',
  'snapshot.raw': 'Open raw document (no toolbar)',
  'snapshot.embedFailedTitle': 'This snapshot cannot be embedded',
  'snapshot.embedFailedBody':
    'Some sites block embedding via X-Frame-Options, CSP, or script rewrites. The archive itself is fine — only the inline preview is blocked.',
  'snapshot.embedFailedCta': 'Open snapshot in a new window',
  'snapshot.reload': 'Reload',
  'snapshot.notice': 'Snapshots are served by the Internet Archive. This site never alters their content.',
  'snapshot.missingParams': 'Snapshot parameters are missing.',
  'snapshot.toolbarTip': 'Tip: the date picker in the Wayback toolbar jumps between neighbouring snapshots.',

  'compare.title': 'Compare eras',
  'compare.lead': 'Put two eras of the same site side by side. Both panes are real Wayback snapshots.',
  'compare.domain': 'Domain',
  'compare.left': 'Left version',
  'compare.right': 'Right version',
  'compare.year': 'Year',
  'compare.month': 'Month (optional)',
  'compare.any': 'Any',
  'compare.run': 'Compare',
  'compare.sync': 'Synced zoom',
  'compare.openBoth': 'Open both in new windows',
  'compare.noSnapshot': 'No snapshot found near that date.',
  'compare.pickYear': 'Pick two years.',
  'compare.sameYear': 'Both versions use the same year.',
  'compare.embedded': 'Inline preview',
  'compare.externalHint': 'If embedding fails, use “Open on Internet Archive”.',

  'eras.title': 'Eras',
  'eras.lead': 'The web did not evolve linearly. Each phase left its own visual dialect behind.',
  'eras.range': 'Range',
  'eras.summary': 'Overview',
  'eras.milestones': 'Milestones',
  'eras.representative': 'Representative sites',
  'eras.explore': 'Explore',
  'eras.source': 'Source',

  'about.title': 'About',
  'about.intro':
    'Internet Time Machine is an open-source tool for exploring web history. It stores no pages and generates no screenshots — it turns your query into a precise CDX request and surfaces exactly what the Internet Archive already saved.',
  'about.dataTitle': 'Data source & boundaries',
  'about.dataBody':
    'All historical data comes from the Internet Archive CDX Server and the Wayback Machine. We only do three things: normalise input, aggregate the yearly index, and assemble snapshot URLs correctly.',
  'about.limitsTitle': 'Known limitations',
  'about.limits1': 'The CDX endpoint sends no CORS headers, so this project ships a minimal proxy that only forwards http/https hostnames.',
  'about.limits2': 'Some snapshots refuse iframe embedding; we offer an external open action instead of faking a preview.',
  'about.limits3': 'Year-by-year queries are slow for very large sites; failed years are explicitly marked unverified.',
  'about.limits4': 'The Internet Archive enforces rate limits, so dense traffic may be briefly throttled.',
  'about.stackTitle': 'Stack',
  'about.stackBody': 'React 19 + TypeScript + Vite + Tailwind CSS, with a Cloudflare Pages Functions proxy.',
  'about.privacyTitle': 'Privacy',
  'about.privacyBody': 'No accounts, no tracking cookies, no third-party analytics. Your queries go only to the Internet Archive.',
  'about.authorTitle': 'Author',
  'about.licenseTitle': 'License',
  'about.licenseBody': 'MIT License. Free to use, modify and redistribute.',
  'about.thanks': 'Thanks to the Internet Archive — without it, none of this would exist.',

  'notFound.title': '404 · Page lost in time',
  'notFound.body': 'No page lives at this address. Perhaps it belongs to another era.',
  'notFound.cta': 'Back home',

  'footer.tagline': 'The Internet Never Forgets.',
  'footer.builtWith': 'Data from the Internet Archive · Open source under MIT',
  'footer.source': 'Source',
  'footer.archive': 'Internet Archive',
  'footer.terms': 'Terms of use',

  'common.back': 'Back',
  'common.retry': 'Retry',
  'common.loading': 'Loading…',
  'common.close': 'Close',
  'common.copy': 'Copy',
  'common.copied': 'Copied',
}

export const DICTS: Record<Lang, Dict> = { zh, en }

export function translate(lang: Lang, key: string): string {
  return DICTS[lang][key] ?? DICTS.en[key] ?? key
}

export interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

export const I18nContext = createContext<I18nValue>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => translate('en', key),
})

export function useI18n(): I18nValue {
  return useContext(I18nContext)
}

export function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'en'
  const stored = safeGet('itm.lang')
  if (stored === 'zh' || stored === 'en') return stored
  const nav = (navigator.language || 'en').toLowerCase()
  return nav.startsWith('zh') ? 'zh' : 'en'
}

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function persistLang(lang: Lang) {
  try {
    window.localStorage.setItem('itm.lang', lang)
  } catch {
    /* storage may be unavailable in private mode — non-fatal */
  }
}