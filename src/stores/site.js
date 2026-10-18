import { ref } from 'vue'
import { defineStore } from 'pinia'

import { fetchResumeProfiles } from '@/api/profile'

/**
 * 后端没接上时用这份占位数据，想先看效果改这里就行。
 * 接上后端的字段映射在文件下半部分的 `normalizeProfile` 里，
 * 后端多给了什么字段、想改展示口径，都去那里加。
 */
const FALLBACK_PROFILE = {
  name: 'duzqiu',
  monogram: 'DZ',
  title: '测试工程师（AI + Python）',
  /* 首页大标题下面那行灰色小字，随时可改 */
  subtitle: '功能测试 · 自动化测试 · 接口测试 · 性能测试 · AI 辅助测试',
  /* 自我评价：接上后端后由接口填充；拿不到数据时这一块不展示 */
  evaluations: [],
  /* 目前状态：代码用于配色，文案直接展示（后端 current_status / current_status_text） */
  status: '在职-考虑机会',
  statusCode: 'employed_open',
  /* 工作年限：接上后端后按工作经历的起止月份计算，这里只是离线兜底 */
  workYears: 5,
  gender: '男',
  age: 28,
  location: '上海',
  phone: '138 0000 0000',
  email: 'you@example.com',
  github: 'https://github.com/your-name',
  intro:
    '做测试这几年主要在接口和自动化这一块：Python 写用例、搭框架，把重复的回归交给机器跑。最近在把大模型接进测试流程，用例生成、日志分析、缺陷归类先试起来。习惯把问题追到根上，缺陷单里复现步骤、日志、截图一并留好。',
  stats: [
    { label: '测试年限', value: '5 年' },
    { label: '自动化用例', value: '1200+ 条' },
    { label: '常写', value: 'Python' },
  ],
  /* 页脚那行「本站使用 … 构建」，按实际情况改 */
  stack: 'Vue3 · Vite + Python · FastAPI',
  skills: [
    'Python',
    'pytest',
    'Playwright',
    'Selenium',
    'Requests',
    'Allure',
    'SQL',
    'JMeter',
    'Docker',
    'Jenkins',
    'Git',
    'LLM 应用',
  ],
  skillGroups: [
    {
      name: '测试与自动化',
      items: ['pytest', 'Playwright', 'Selenium', 'Requests', 'Allure', 'JMeter'],
    },
    {
      name: '语言与数据',
      items: ['Python', 'SQL', 'Pandas', 'MySQL', 'Redis'],
    },
    {
      name: '工程化与 AI',
      items: ['Docker', 'Jenkins', 'Git', 'Linux', 'LangChain', 'OpenAI API'],
    },
  ],
  experience: [
    {
      period: '2024 - 至今',
      title: '测试开发工程师',
      org: '某科技公司',
      desc: '接口自动化从零搭起来，用例挂在 Jenkins 上每晚跑，回归从两天缩到 40 分钟。最近在试把大模型接进流程：读需求生成用例草稿、按失败日志归堆，人只做复核。',
    },
    {
      period: '2022 - 2024',
      title: '自动化测试工程师',
      org: '某互联网公司',
      desc: '订单和结算两条链路的自动化由我维护，Playwright 覆盖下单到退款的主流程。接口字段一改，用例先报红，比等用户反馈快得多。',
    },
    {
      period: '2021 - 2022',
      title: '测试工程师',
      org: '某创业团队',
      desc: '功能测试为主，顺手把手工用例整理成可执行的 pytest 脚本。也是从这时起，习惯把复现步骤、日志和截图一起留在缺陷单里。',
    },
    /* 下面几条是凑数的 mock，专门用来把「经历」撑出滚动条，正经填的时候删掉 */
    {
      period: '2020 - 2021',
      title: '测试实习生',
      org: '某电商公司',
      desc: '在校期间去实习，跟着做商品和库存的回归。头两个月补历史接口的用例，后来独立写了一版库存扣减的校验脚本，超卖这类边界问题就是从这儿开始留意的。',
    },
    {
      period: '2019 - 2020',
      title: '校园项目',
      org: '某大学',
      desc: '和同学一起做的选课助手，我负责接口测试和部署。也是在这儿第一次把用例评审、缺陷流转这些事定成规矩。',
    },
  ],
  /* 读过几段就写几段，字段不够用自己加 */
  education: [
    {
      period: '2017 - 2021',
      school: '某大学',
      degree: '本科',
      major: '计算机科学与技术',
      note: '主修偏后端和数据库。毕业设计做的是一个校园二手交易平台，接口、页面、部署都是自己走完的。',
    },
  ],
}

const FALLBACK_PROJECTS = [
  {
    name: '个人网站',
    company: '个人项目',
    period: '2026',
    desc: '你现在看的这个站。前台是 Vue 3 加 Vite，资料和项目列表都从 FastAPI 接口取，接口没通的时候退回本地那份数据，不至于开天窗。',
    duty: '从设计到上线都是自己走完的：页面按 6 列网格排，主题切换、滚动进场、页面切换这些动效都手写，没引组件库；内容统一走 FastAPI 接口，接口拿不到数据就退回本地那份，页面不至于开天窗。部署在一台小服务器上，Nginx 配了反向代理和静态资源缓存，打包产物文件名带 hash，直接给一年缓存，回源压力很小。',
    achievement: '首屏资源 gzip 后不到 40KB，Lighthouse 性能分稳定在 95 以上；接口挂掉时页面照常可看，只是退到本地占位数据。',
    tags: ['Vue 3', 'Vite', 'FastAPI', 'SCSS'],
    url: '',
  },
  {
    name: '接口自动化测试平台',
    company: '个人项目',
    period: '2025',
    desc: '把散在各处的接口用例收进一个仓库，按模块分组执行，报告统一出。新接口接进来只要写 YAML 加几条断言。',
    duty: 'pytest 做执行内核，用例数据抽成 YAML，环境、账号、鉴权参数都在配置里切换。Allure 出报告并归档历史，Jenkins 每晚定时跑，失败用例自动重跑一次排除环境抖动。断言层封了通用的响应校验，业务同学不写代码也能补用例。',
    achievement: '默认每晚 1200+ 条用例跑完 12 分钟左右，回归从两天压到 40 分钟；环境抖动导致的误报靠自动重跑挡掉大半。',
    tags: ['pytest', 'Allure', 'Jenkins', 'YAML'],
    url: '',
  },
  {
    name: 'AI 用例生成助手',
    company: '某科技公司',
    period: '2025',
    desc: '读需求文档和接口文档，先出一版用例草稿，人工在评审里补漏，比从空白页开始快不少。',
    duty: '文档切段后走 LLM 生成用例，按等价类、边界值、异常流分组给提示词，结果输出成评审用的表格，每条都带来源段落，方便对照需求。后来接了缺陷库做相似缺陷推荐，减少重复遗漏。也踩过坑：模型爱编不存在的字段，最后加了接口 schema 校验这一层兜底。',
    achievement: '需求评审前的用例初稿基本不再从空白页开始，单个需求的用例起草时间从半天缩到一小时内，评审主要用来补漏。',
    tags: ['LLM', 'Prompt', 'FastAPI'],
    url: '',
  },
  {
    name: 'Web UI 自动化回归',
    company: '某互联网公司',
    period: '2024',
    desc: '核心流程的 UI 回归，从下单到退款跑一遍，发版前自动触发。',
    duty: 'Playwright 写用例，页面对象模式收公共操作，定位器统一用语义选择器，改版时只动一处。用例跑在容器里，失败自动留存截图、trace 和视频，排查时不用再问「能不能复现」。',
    achievement: '下单到退款主流程覆盖 40 余条用例，发版前跑一轮约 8 分钟；改版导致的用例失效基本只改一处定位器就能恢复。',
    tags: ['Playwright', 'Docker', 'CI'],
    url: '',
  },
]

/**
 * 后端月份字段是 `YYYY-MM`（简历只精确到月），页面上换成「2020.09 - 至今」。
 * 结束时间为空就是「至今」，这也是后端的约定。
 */
function formatMonth(value) {
  return (value || '').trim().replace(/-/g, '.')
}

function formatPeriod(start, end) {
  const from = formatMonth(start)
  const to = formatMonth(end)
  if (!from && !to) return ''
  if (!from) return `- ${to || '至今'}`
  if (!to) return `${from} - 至今`

  // 起止同一年时把结束年份省掉：2026.01 - 10（跨年才写全 2025.09 - 2026.02）
  const sameYear =
    from.includes('.') && to.includes('.') && from.slice(0, 4) === to.slice(0, 4)
  return `${from} - ${sameYear ? to.slice(5) : to}`
}

/** 生日 -> 年龄（后端只给生日，年龄是算出来的）；没填或格式不对就返回 null */
function ageFromBirthday(birthday) {
  if (!birthday) return null
  const born = new Date(birthday)
  if (Number.isNaN(born.getTime())) return null

  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  const monthDiff = now.getMonth() - born.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < born.getDate())) age -= 1
  return age > 0 ? age : null
}

/**
 * 把后端那套「简历结构」拍平成页面用的 profile。
 *
 * 约定：
 * - **文本字段**后端没值时退回本地占位（标题、简介这类硬编一句总比空着好）；
 * - **列表字段**完全听后端的（经历 / 教育 / 技能 / 评价），后端没数据就不展示那一段，
 *   免得页面上出现几条「凑数」的假经历；
 * - 后端的 `job_intention` 就是首页大标题那句话，`remark` 当作简介。
 */
function normalizeProfile(raw) {
  const info = raw?.personal_info || {}
  const works = Array.isArray(raw?.work_experiences) ? raw.work_experiences : []
  const educations = Array.isArray(raw?.educations) ? raw.educations : []
  const evaluations = Array.isArray(raw?.evaluations) ? raw.evaluations : []
  const skillGroups = (Array.isArray(raw?.skill_tags) ? raw.skill_tags : [])
    .map((item) => ({
      name: item.category || '其他',
      items: Array.isArray(item.tags) ? item.tags : [],
    }))
    .filter((group) => group.items.length)

  const name = info.name || FALLBACK_PROFILE.name

  return {
    ...FALLBACK_PROFILE,
    name,
    // 头像没传就用姓名首字当字母块，和原来那套占位保持一致
    monogram: name.slice(0, 1).toUpperCase(),
    avatar: info.avatar || '',
    title: info.job_intention || FALLBACK_PROFILE.title,
    intro: info.remark || FALLBACK_PROFILE.intro,
    statusCode: info.current_status || FALLBACK_PROFILE.statusCode,
    status: info.current_status_text || FALLBACK_PROFILE.status,
    // 后台填写的工作年限优先；为 0 时页面会按工作经历自动计算
    workYears: Number(info.work_years) || 0,
    gender: info.gender_text || FALLBACK_PROFILE.gender,
    age: ageFromBirthday(info.birthday) ?? FALLBACK_PROFILE.age,
    location: info.city || FALLBACK_PROFILE.location,
    phone: info.phone || FALLBACK_PROFILE.phone,
    email: info.email || FALLBACK_PROFILE.email,
    website: info.website || '',
    evaluations: evaluations
      .filter((item) => (item.content || '').trim())
      .map((item) => ({
        title: item.title || '自我评价',
        content: item.content.trim(),
      })),
    experience: works.map((work) => ({
      period: formatPeriod(work.start_month, work.end_month),
      // 原始月份留给页面算工作年限（period 是展示文案，不便再解析）
      start: work.start_month || '',
      end: work.end_month || '',
      title: work.position || work.department || '',
      org: work.company || '',
      desc: work.description || '',
    })),
    education: educations.map((item) => ({
      period: formatPeriod(item.start_month, item.end_month),
      school: item.school || '',
      degree: item.degree_text || '',
      major: item.major || '',
      note: item.description || '',
    })),
    skillGroups,
    skills: skillGroups.flatMap((group) => group.items),
  }
}

/** 项目经历挂在工作经历下面，拍平成一维列表给「项目」那一栏用 */
function normalizeProjects(raw) {
  const works = Array.isArray(raw?.work_experiences) ? raw.work_experiences : []

  return works.flatMap((work) =>
    (Array.isArray(work.projects) ? work.projects : []).map((project) => ({
      name: project.name || '',
      company: work.company || '',
      period: formatPeriod(project.start_month, project.end_month),
      desc: project.description || '',
      duty: project.duty || '',
      achievement: project.achievement || '',
      // 后端项目没有标签 / 外链字段，留空即可，卡片会自动不显示
      tags: [],
      url: '',
    })),
  )
}

export const useSiteStore = defineStore('site', () => {
  const profile = ref({ ...FALLBACK_PROFILE })
  const projects = ref(FALLBACK_PROJECTS.map((item) => ({ ...item })))
  const loading = ref(false)
  /** 后端通没通：没通也不拦着页面显示，只是用本地占位数据 */
  const online = ref(false)

  /**
   * 资料和项目来自**同一个**接口，组件里两处都会调 load*，
   * 所以用这个 promise 把并发请求并成一次，避免刚进站就发两条一样的请求。
   */
  let pending = null

  async function loadResume() {
    if (pending) return pending

    pending = (async () => {
      loading.value = true
      try {
        // VITE_PROFILE_ID 配了就拿指定的人，没配就取启用中的第一个人
        const personalId = Number(import.meta.env.VITE_PROFILE_ID || 0)
        const params = personalId > 0 ? { personal_info_id: personalId } : { limit: 1 }
        const data = await fetchResumeProfiles(params)
        const first = Array.isArray(data) ? data[0] : null
        if (!first) throw new Error('后端还没有启用的简历数据')

        profile.value = normalizeProfile(first)
        projects.value = normalizeProjects(first)
        online.value = true
      } catch {
        // 接口挂了 / 没数据：保留本地占位，页面照常显示
        online.value = false
      } finally {
        loading.value = false
        pending = null
      }
    })()

    return pending
  }

  async function loadProfile() {
    await loadResume()
  }

  async function loadProjects() {
    await loadResume()
  }

  return { profile, projects, loading, online, loadProfile, loadProjects, reload: loadResume }
})
