import type { Era, EraId } from '../types'

/**
 * Curated catalog of sites whose archived history is genuinely deep and
 * visually distinctive. Every entry is verified through the live CDX API at
 * runtime — the UI never assumes a snapshot exists.
 */
export const SITE_CATALOG: {
  domain: string
  name: string
  zhName: string
  era: EraId
  blurbZh: string
  blurbEn: string
}[] = [
  { domain: 'google.com', name: 'Google', zhName: '谷歌', era: 'portal', blurbZh: '从斯坦福机房到全球信息入口，首页的每一次减法都是一次豪赌。', blurbEn: 'From a Stanford dorm rig to the world’s front door — every pixel removed was a bet.' },
  { domain: 'apple.com', name: 'Apple', zhName: '苹果', era: 'portal', blurbZh: '二十余年里，苹果官网把自己的产品信仰做成了极简主义的教科书。', blurbEn: 'Two decades of turning product conviction into a minimalism textbook.' },
  { domain: 'yahoo.com', name: 'Yahoo!', zhName: '雅虎', era: 'dawn', blurbZh: '门户时代的紫色帝国，曾经是互联网本身的样子。', blurbEn: 'The purple empire of the portal era — once, it *was* the internet.' },
  { domain: 'amazon.com', name: 'Amazon', zhName: '亚马逊', era: 'portal', blurbZh: '从“地球最大书店”到万货商店，页面密度记录了野心的膨胀。', blurbEn: 'From Earth’s Biggest Bookstore to everything-store: density as a record of ambition.' },
  { domain: 'microsoft.com', name: 'Microsoft', zhName: '微软', era: 'dawn', blurbZh: '桌面霸主的首页如何从产品公告板演化为云服务入口。', blurbEn: 'How the desktop giant’s homepage turned from product board into cloud console.' },
  { domain: 'youtube.com', name: 'YouTube', zhName: '油管', era: 'web2', blurbZh: '2005 年的“Broadcast Yourself”，一个尚未被推荐算法接管的世界。', blurbEn: 'Broadcast Yourself in 2005: a world not yet ruled by recommendation.' },
  { domain: 'wikipedia.org', name: 'Wikipedia', zhName: '维基百科', era: 'web2', blurbZh: '极少数越活越像自己的网站，二十多年只做了一点微调。', blurbEn: 'One of the rare sites that stayed itself — two decades of micro-adjustments.' },
  { domain: 'facebook.com', name: 'Facebook', zhName: '脸书', era: 'web2', blurbZh: '从哈佛宿舍的“The Facebook”到十亿人的信息流。', blurbEn: 'From a Harvard dorm’s “The Facebook” to a billion-person feed.' },
  { domain: 'twitter.com', name: 'Twitter', zhName: '推特', era: 'web2', blurbZh: '140 字符如何重塑了公共话语的形状。', blurbEn: 'How 140 characters reshaped the shape of public speech.' },
  { domain: 'geocities.com', name: 'GeoCities', zhName: '地球村', era: 'dawn', blurbZh: '个人主页的黄金年代：闪烁的 GIF、访客计数器与 Under Construction。', blurbEn: 'The golden age of personal pages: blinking GIFs, hit counters, Under Construction.' },
  { domain: 'myspace.com', name: 'MySpace', zhName: '我的空间', era: 'web2', blurbZh: '自动播放的背景音乐，是整整一代人的社交记忆。', blurbEn: 'Auto-playing profile songs: a whole generation’s social memory.' },
  { domain: 'cnn.com', name: 'CNN', zhName: 'CNN', era: 'portal', blurbZh: '新闻网站如何在 24 小时滚动与页面性能之间反复权衡。', blurbEn: 'How a news site kept re-balancing 24-hour rolling coverage against page weight.' },
  { domain: 'nytimes.com', name: 'The New York Times', zhName: '纽约时报', era: 'portal', blurbZh: '报业数字化转型最漫长也最昂贵的一次迁移。', blurbEn: 'The longest and costliest migration in newspaper digital history.' },
  { domain: 'ebay.com', name: 'eBay', zhName: 'eBay', era: 'portal', blurbZh: '分类列表页面的鼻祖，信息密度就是它的美学。', blurbEn: 'The ancestor of the listing page — density as aesthetics.' },
  { domain: 'adobe.com', name: 'Adobe', zhName: '奥多比', era: 'portal', blurbZh: '软件公司官网如何从光盘邮购目录变成创意云橱窗。', blurbEn: 'From mail-order CD catalog to creative cloud storefront.' },
  { domain: 'nasa.gov', name: 'NASA', zhName: 'NASA', era: 'dawn', blurbZh: '太空机构的网站一度是“深空背景 + 斜体字”的代名词。', blurbEn: 'A space agency whose site once meant deep-space background plus italics.' },
  { domain: 'bbc.com', name: 'BBC', zhName: 'BBC', era: 'portal', blurbZh: '公共广播机构把编辑判断带进浏览器的方式。', blurbEn: 'How a public broadcaster carried editorial judgement into the browser.' },
  { domain: 'reddit.com', name: 'Reddit', zhName: '红迪', era: 'web2', blurbZh: '一个几乎不做设计的网站，却定义了社区产品的形态。', blurbEn: 'A site that barely designed itself, yet defined community products.' },
  { domain: 'github.com', name: 'GitHub', zhName: 'GitHub', era: 'mobile', blurbZh: '开发者社交的默认界面，也是“深色代码”美学的起点。', blurbEn: 'The default interface of developer social life, and the origin of dark-code aesthetics.' },
  { domain: 'spotify.com', name: 'Spotify', zhName: '声田', era: 'mobile', blurbZh: '流媒体把“拥有音乐”改写成“访问音乐”的那一步。', blurbEn: 'The step where streaming rewrote owning music into accessing it.' },
  { domain: 'netflix.com', name: 'Netflix', zhName: '奈飞', era: 'portal', blurbZh: '红色信封到红色 N，一次彻底的自我颠覆。', blurbEn: 'From red envelope to red N: a complete self-disruption.' },
  { domain: 'w3.org', name: 'W3C', zhName: '万维网联盟', era: 'dawn', blurbZh: '标准组织的网站，几乎是不加修饰的 HTML 原教旨主义。', blurbEn: 'A standards body’s site: unadorned HTML fundamentalism.' },
  { domain: 'stripe.com', name: 'Stripe', zhName: 'Stripe', era: 'platform', blurbZh: '把开发者文档做成产品本身的典范。', blurbEn: 'The canonical case of documentation becoming the product.' },
  { domain: 'openai.com', name: 'OpenAI', zhName: 'OpenAI', era: 'ai', blurbZh: '一个非营利实验室的页面，如何在两年内变成全行业的风向标。', blurbEn: 'A nonprofit lab’s page that became the industry bellwether in two years.' },
]

export const CURATED_DOMAINS = SITE_CATALOG.map((s) => s.domain)

export function findSite(domain: string) {
  const d = domain.toLowerCase().replace(/^www\./, '')
  return SITE_CATALOG.find((s) => s.domain === d)
}

/**
 * Era definitions. Facts below reference well-documented, publicly verifiable
 * milestones; each carries the primary source that a reader can check.
 */
export const ERAS: Era[] = [
  {
    id: 'dawn',
    range: [1991, 1999],
    rangeZh: '1990s',
    rangeEn: '1990s',
    titleZh: '早期互联网',
    titleEn: 'The Early Web',
    summaryZh:
      '万维网从 CERN 的一台 NeXT 工作站走向公众。页面是灰底、蓝链、表格布局，图片加载需要等待，而“上网”本身仍是一种稀缺行为。',
    summaryEn:
      'The Web walked out of a NeXT machine at CERN and into public life. Grey backgrounds, blue links, table layouts — and the wait for images to load. Going online was still a scarce act.',
    facts: [
      { year: '1991', zh: '8 月 6 日，Tim Berners-Lee 发布第一个公开的万维网项目摘要。', en: '6 Aug: Tim Berners-Lee posts the first public summary of the World Wide Web project.', source: 'https://www.w3.org/History/19921103-hypertext/hypertext/WWW/TheProject.html' },
      { year: '1993', zh: 'NCSA Mosaic 发布，图形浏览器让万维网进入大众视野。', en: 'NCSA Mosaic ships, bringing the graphical browser to a mass audience.', source: 'https://www.ncsa.illinois.edu/"' },
      { year: '1995', zh: 'Amazon 与 eBay 上线，电子商务的第一批地基被铺下。', en: 'Amazon and eBay launch, laying the first foundations of e-commerce.', source: 'https://www.amazon.com/' },
      { year: '1998', zh: 'Google 公司成立；同年 Internet Archive 开始系统存档网页。', en: 'Google is incorporated; the same year the Internet Archive begins systematic web archiving.', source: 'https://archive.org/about/' },
    ],
    sites: ['yahoo.com', 'geocities.com', 'microsoft.com', 'nasa.gov', 'w3.org'],
  },
  {
    id: 'portal',
    range: [2000, 2005],
    rangeZh: '2000–2005',
    rangeEn: '2000–2005',
    titleZh: '门户网站时代',
    titleEn: 'The Portal Era',
    summaryZh:
      '门户把新闻、邮箱、搜索、天气塞进同一张首页。信息密度即是价值主张，广告位即是商业模式。泡沫破裂之后，活下来的网站学会了把流量变成现金流。',
    summaryEn:
      'Portals stacked news, mail, search and weather onto one homepage. Density was the value proposition; ad slots were the business model. After the bubble burst, survivors learned to turn traffic into cash flow.',
    facts: [
      { year: '2000', zh: '3 月 10 日纳斯达克指数见顶 5048.62 点，随后互联网泡沫开始破裂。', en: '10 Mar: the Nasdaq peaks at 5048.62 before the dot-com bubble deflates.', source: 'https://www.nasdaq.com/' },
      { year: '2001', zh: '维基百科上线，用协作方式重写百科全书的成本结构。', en: 'Wikipedia launches, rewriting the cost structure of encyclopedias through collaboration.', source: 'https://en.wikipedia.org/wiki/Wikipedia' },
      { year: '2003', zh: 'WordPress 发布，个人出版的门槛降到“会打字”即可。', en: 'WordPress ships, lowering personal publishing to “can you type”.', source: 'https://wordpress.org/news/' },
      { year: '2004', zh: 'Gmail 以 1GB 容量打破免费邮箱的容量假设。', en: 'Gmail resets free-mail assumptions with 1 GB of storage.', source: 'https://mail.google.com/' },
    ],
    sites: ['google.com', 'apple.com', 'amazon.com', 'ebay.com', 'cnn.com', 'nytimes.com', 'bbc.com', 'adobe.com'],
  },
  {
    id: 'web2',
    range: [2006, 2010],
    rangeZh: '2006–2010',
    rangeEn: '2006–2010',
    titleZh: 'Web 2.0 与用户生成内容',
    titleEn: 'Web 2.0 & User-Generated Content',
    summaryZh:
      '用户从读者变成作者。圆角、渐变、光泽按钮与 AJAX 一起定义了这一时期的视觉语言，也定义了“刷新页面”这件事的终结。',
    summaryEn:
      'Readers became authors. Rounded corners, gradients, glossy buttons and AJAX defined both the visual language of the period and the end of “reloading the page”.',
    facts: [
      { year: '2005', zh: 'YouTube 上线，“Broadcast Yourself”成为视频分发的宣言。', en: 'YouTube launches; “Broadcast Yourself” becomes a distribution manifesto.', source: 'https://www.youtube.com/' },
      { year: '2006', zh: 'Twitter 推出公开时间线，微博客形态成型。', en: 'Twitter opens its public timeline, crystallising the microblog form.', source: 'https://x.com/' },
      { year: '2007', zh: 'iPhone 发布，为三年后的移动 Web 重构埋下伏笔。', en: 'The iPhone ships, seeding the mobile-web rebuild that arrives three years later.', source: 'https://www.apple.com/newsroom/' },
      { year: '2008', zh: 'Chrome 发布，JavaScript 引擎性能开始以倍数为单位提升。', en: 'Chrome ships; JavaScript engine performance starts improving by multiples.', source: 'https://blog.chromium.org/' },
    ],
    sites: ['youtube.com', 'wikipedia.org', 'facebook.com', 'twitter.com', 'myspace.com', 'reddit.com'],
  },
  {
    id: 'mobile',
    range: [2011, 2015],
    rangeZh: '2011–2015',
    rangeEn: '2011–2015',
    titleZh: '移动互联网',
    titleEn: 'The Mobile Web',
    summaryZh:
      '响应式设计、汉堡菜单与卡片式布局成为共识。网站的默认视口从 1024 像素宽变成了 375 像素宽，导航必须折叠，内容必须重新排序。',
    summaryEn:
      'Responsive design, hamburger menus and card layouts became consensus. The default viewport went from 1024 pixels wide to 375, forcing navigation to collapse and content to re-order.',
    facts: [
      { year: '2011', zh: '响应式网页设计（RWD）概念被系统提出，媒体查询成为基础技能。', en: 'Responsive web design is articulated as a discipline; media queries become table stakes.', source: 'https://alistapart.com/article/responsive-web-design/' },
      { year: '2012', zh: '移动流量占比在多个大型站点越过 20%。', en: 'Mobile traffic crosses 20% at several large sites.', source: 'https://www.statista.com/' },
      { year: '2013', zh: '扁平化设计取代拟物化，阴影与纹理被大面积移除。', en: 'Flat design displaces skeuomorphism; shadows and textures are stripped back.', source: 'https://developer.apple.com/design/' },
      { year: '2015', zh: 'Google 推出 Mobilegeddon，移动友好度直接影响搜索排名。', en: 'Google’s “Mobilegeddon” makes mobile-friendliness a ranking factor.', source: 'https://developers.google.com/search/blog' },
    ],
    sites: ['github.com', 'spotify.com', 'facebook.com', 'apple.com', 'twitter.com'],
  },
  {
    id: 'platform',
    range: [2016, 2020],
    rangeZh: '2016–2020',
    rangeEn: '2016–2020',
    titleZh: '平台化互联网',
    titleEn: 'The Platform Internet',
    summaryZh:
      '网站不再只是页面，而是被 API、设计系统与暗色模式统一起来的平台。开发者体验本身变成了营销语言，文档即产品。',
    summaryEn:
      'Sites stopped being pages and became platforms unified by APIs, design systems and dark mode. Developer experience itself became marketing language; docs became the product.',
    facts: [
      { year: '2017', zh: '设计系统在大型组织中普及，颜色与间距开始被 token 化。', en: 'Design systems spread across large orgs; colour and spacing become tokens.', source: 'https://www.w3.org/TR/design-tokens/' },
      { year: '2018', zh: 'GDPR 生效，Cookie 同意条成为欧洲网站的新常态元素。', en: 'GDPR takes effect; the cookie consent bar becomes a fixture of European sites.', source: 'https://gdpr-info.eu/' },
      { year: '2019', zh: '暗色模式成为操作系统级设置，网站被迫开始支持双主题。', en: 'Dark mode becomes an OS-level setting, forcing sites to support dual themes.', source: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme' },
      { year: '2020', zh: '远程协作爆发，浏览器成为主要工作界面。', en: 'Remote work explodes; the browser becomes the primary work surface.', source: 'https://www.w3.org/' },
    ],
    sites: ['stripe.com', 'github.com', 'notion.so', 'vercel.com', 'cloudflare.com'],
  },
  {
    id: 'ai',
    range: [2021, 2026],
    rangeZh: '2021–至今',
    rangeEn: '2021–now',
    titleZh: 'AI 与新互联网时代',
    titleEn: 'AI & The New Internet',
    summaryZh:
      '生成式模型把“搜索框”改造成对话入口。页面开始由模型实时生成，而历史存档的价值反而上升——它成为唯一可信的、未经过滤的时间证据。',
    summaryEn:
      'Generative models turned the search box into a conversation. Pages began to be generated live — and archived history became more valuable than ever: the only unfiltered evidence of time.',
    facts: [
      { year: '2022', zh: '11 月 30 日 ChatGPT 发布，对话式界面在两月内达到一亿用户量级。', en: '30 Nov: ChatGPT launches; the conversational interface reaches a hundred million users within two months.', source: 'https://openai.com/blog/chatgpt' },
      { year: '2023', zh: '生成式内容大规模涌入索引，搜索引擎开始标注“AI 生成”。', en: 'Generated content floods the index; search engines start labelling “AI generated”.', source: 'https://blog.google/' },
      { year: '2024', zh: '网页存档与数据溯源成为模型训练合规讨论的核心议题。', en: 'Web archiving and provenance become central to training-data compliance debates.', source: 'https://archive.org/' },
      { year: '2025', zh: '多模态代理开始直接操作浏览器，界面本身成为被调用的接口。', en: 'Multimodal agents begin operating browsers directly; the interface itself becomes a callable API.', source: 'https://www.w3.org/' },
    ],
    sites: ['openai.com', 'google.com', 'stripe.com', 'github.com', 'wikipedia.org'],
  },
]

export function eraById(id: string): Era | undefined {
  return ERAS.find((e) => e.id === id)
}

export function eraOfYear(year: number): Era | undefined {
  return ERAS.find((e) => year >= e.range[0] && year <= e.range[1])
}