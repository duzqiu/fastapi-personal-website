<template>
  <div v-if="resolved && online" class="container about">
    <SectionHeading eyebrow="关于" title="关于我" />

    <!-- 顶排：左边资料卡，右边简介卡（等高于左侧） -->
    <section class="bento">
      <aside class="profile card" v-reveal>
        <div class="profile__avatar">
          <img v-if="profile.avatar" :src="profile.avatar" :alt="profile.name" />
          <template v-else>{{ profile.monogram }}</template>
        </div>

        <div class="profile__name-row">
          <p class="profile__name">{{ profile.name }}</p>
          <span v-if="profile.age" class="profile__age">{{ profile.age }} 岁</span>
        </div>
        <p class="profile__tip">{{ profile.title }}</p>

        <span
          v-if="profile.status"
          class="profile__status"
          :class="`profile__status--${statusTone}`"
        >
          {{ profile.status }}
        </span>

        <ul class="profile__meta">
          <li>
            <svg class="profile__icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="3.4" />
              <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
            </svg>
            <span class="profile__label">性别</span>
            <span class="profile__value">{{ profile.gender }}</span>
          </li>
          <li>
            <svg class="profile__icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3.5" y="7.5" width="17" height="13" rx="2.5" />
              <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 12.5h17" />
            </svg>
            <span class="profile__label">年限</span>
            <span class="profile__value">{{ workYearsValue }}</span>
          </li>
          <li>
            <svg class="profile__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20.5s6-5.6 6-10.3a6 6 0 1 0-12 0c0 4.7 6 10.3 6 10.3Z" />
              <circle cx="12" cy="10" r="2.3" />
            </svg>
            <span class="profile__label">所在地</span>
            <span class="profile__value">{{ profile.location }}</span>
          </li>
        </ul>

        <!-- 联系方式并进资料卡：只做展示，邮箱额外提供复制 -->
        <ul v-if="profile.email || profile.phone || profile.website" class="profile__contacts">
          <li v-if="profile.email">
            <!-- 邮箱不调起本地邮件客户端，只提供复制 -->
            <div class="profile__contact">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
                <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
              </svg>
              <span class="profile__contact-text" :title="profile.email">
                {{ profile.email }}
              </span>
              <button
                class="profile__copy"
                :class="{ 'is-done': copiedEmail }"
                type="button"
                :aria-label="copiedEmail ? '邮箱已复制' : '复制邮箱'"
                :title="copiedEmail ? '邮箱已复制' : '复制邮箱'"
                @click="copyEmail"
              >
                <svg v-if="!copiedEmail" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="9" y="9" width="11" height="11" rx="2.5" />
                  <path d="M15 6.5V5.5A1.5 1.5 0 0 0 13.5 4h-8A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15h1" />
                </svg>
                <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m4.5 12.5 5 5 10-11" />
                </svg>
                <span>{{ copiedEmail ? '已复制' : '复制' }}</span>
              </button>
            </div>
          </li>
          <li v-if="profile.phone">
            <div class="profile__contact">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M8.5 3.8 11 8.6l-2.2 2.2a12 12 0 0 0 4.4 4.4l2.2-2.2 4.8 2.5v3.2a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 6a2 2 0 0 1 2-2.2Z"
                />
              </svg>
              <span class="profile__contact-text" :title="profile.phone">
                {{ profile.phone }}
              </span>
            </div>
          </li>
          <li v-if="profile.website">
            <div class="profile__contact">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M3.5 12h17M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5S14.2 18.2 12 20.5c-2.2-2.3-3.3-5.1-3.3-8.5S9.8 5.8 12 3.5Z" />
              </svg>
              <span class="profile__contact-text" :title="profile.website">
                {{ websiteLabel }}
              </span>
            </div>
          </li>
        </ul>
      </aside>

      <article class="intro card" v-reveal="100">
        <div class="card-head">
          <span class="card-head__label">个人简介</span>
          <span class="card-head__rule" />
        </div>

        <!-- 自我评价：后端给的评价逐条铺开，最多两条，避免把卡片撑太长 -->
        <div v-if="evaluations.length" class="intro__evals">
          <div v-for="(item, i) in evaluations" :key="`${item.title}-${i}`" class="intro__eval">
            <p class="intro__eval-title">{{ item.title }}</p>
            <p class="intro__eval-text">{{ item.content }}</p>
          </div>
        </div>

        <!-- 数字直接从当前数据算，不写死 -->
        <ul class="intro__stats">
          <li>
            <strong>{{ projects.length }}</strong>
            <span>个项目</span>
          </li>
          <li>
            <strong>{{ skillCount }}</strong>
            <span>项技能</span>
          </li>
          <li>
            <strong>{{ profile.experience?.length || 0 }}</strong>
            <span>段经历</span>
          </li>
        </ul>
      </article>
    </section>

    <!-- 技能：独立成一节，卡片按宽度自动铺满 -->
    <section v-if="profile.skillGroups?.length" class="section" v-reveal>
      <div class="section__head">
        <h2 class="block__title">技能</h2>
        <span class="section__count">
          {{ profile.skillGroups.length }} 组 · {{ skillCount }} 项
        </span>
      </div>

      <div class="skill-grid">
        <div v-for="group in profile.skillGroups" :key="group.name" class="skill card card--hover">
          <div class="skill__head">
            <p class="skill__name">{{ group.name }}</p>
            <span class="skill__count">{{ group.items.length }}</span>
          </div>
          <ul class="skill__items">
            <li v-for="item in group.items" :key="item" class="chip">{{ item }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 项目 -->
    <section v-if="projects.length" class="section" v-reveal>
      <div class="section__head">
        <h2 class="block__title">项目</h2>
        <span class="section__count">{{ projects.length }} 个</span>
      </div>

      <div class="bento">
        <ProjectCard
          v-for="(item, i) in projects"
          :key="item.name"
          :project="item"
          :index="String(i + 1).padStart(2, '0')"
        />
      </div>
    </section>

    <!-- 经历 -->
    <section v-if="profile.experience?.length" class="section" v-reveal>
      <div class="section__head">
        <h2 class="block__title">经历</h2>
        <span class="section__count">{{ profile.experience.length }} 段</span>
      </div>

      <div class="bento">
        <div class="timeline card">
          <ol class="timeline__list">
            <li
              v-for="(item, index) in profile.experience"
              :key="`${item.period}-${index}`"
              class="timeline__item"
            >
              <span class="timeline__period">{{ item.period }}</span>
              <div class="timeline__content">
                <span class="timeline__dot" />
                <p class="timeline__title">
                  {{ item.org }}
                  <span class="timeline__role">{{ item.title }}</span>
                </p>
                <p class="timeline__desc muted">{{ item.desc }}</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- 教育：与工作共用同一套时间线 -->
    <section v-if="profile.education?.length" class="section" v-reveal>
      <div class="section__head">
        <h2 class="block__title">教育</h2>
        <span class="section__count">{{ profile.education.length }} 段</span>
      </div>

      <div class="bento">
        <div class="timeline card">
          <ol class="timeline__list">
            <li v-for="item in profile.education" :key="item.period" class="timeline__item">
              <span class="timeline__period">{{ item.period }}</span>
              <div class="timeline__content">
                <span class="timeline__dot" />
                <p class="timeline__title">
                  {{ item.school }}
                  <span class="timeline__org">{{ item.degree }} · {{ item.major }}</span>
                </p>
                <p class="timeline__desc muted">{{ item.note }}</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  </div>

  <!-- 接口没通 / 没有启用中的简历：给一张缺省页，不再拿本地占位数据顶替 -->
  <div v-else class="container about">
    <SectionHeading eyebrow="关于" title="关于我" />

    <section v-if="!resolved" class="empty-state card" aria-live="polite">
      <span class="empty-state__spinner" aria-hidden="true" />
      <p class="empty-state__title">正在加载</p>
      <p class="empty-state__desc">正在读取简历数据…</p>
    </section>

    <EmptyState v-else title="暂无数据" desc="关于我接口暂时不可用，请稍后再试" />
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import EmptyState from '@/components/EmptyState.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { useSiteStore } from '@/stores/site'

const site = useSiteStore()
const { profile, projects, resolved, online } = storeToRefs(site)

/** 目前状态代码 -> 配色档位（与后端 ResumeCurrentStatus 对应） */
const STATUS_TONES = {
  resigned: 'resigned',
  left: 'left',
  employed_open: 'open',
  employed_closed: 'closed',
}
const statusTone = computed(
  () => STATUS_TONES[profile.value.statusCode] || 'default',
)

/** 「YYYY-MM」转成连续月份序号；空 / 格式不对返回 null */
const MONTH_PATTERN = /^(\d{4})-(\d{2})$/

function monthIndex(value) {
  const match = MONTH_PATTERN.exec(String(value || ''))
  if (!match) return null
  return Number(match[1]) * 12 + Number(match[2]) - 1
}

/**
 * 工作年限：后台填了就直接用；填 0（未设置）才回退到
 * 「把各段工作经历合并后算总月数（重叠的只算一次）」。
 * 结束月份为空按「至今」处理，未来的结束时间截到当前月。
 */
const workYearsValue = computed(() => {
  const manual = Number(profile.value.workYears)
  if (Number.isFinite(manual) && manual > 0) return `${manual} 年`

  const now = new Date()
  const nowIndex = now.getFullYear() * 12 + now.getMonth()

  const ranges = (profile.value.experience || [])
    .map((item) => {
      const start = monthIndex(item.start)
      if (start === null || start > nowIndex) return null
      const end = Math.min(monthIndex(item.end) ?? nowIndex, nowIndex)
      return [start, Math.max(start, end)]
    })
    .filter(Boolean)
    .sort((a, b) => a[0] - b[0])

  if (!ranges.length) return ''

  let total = 0
  let [rangeStart, rangeEnd] = ranges[0]
  for (const [start, end] of ranges.slice(1)) {
    if (start <= rangeEnd + 1) {
      rangeEnd = Math.max(rangeEnd, end)
    } else {
      total += rangeEnd - rangeStart + 1
      rangeStart = start
      rangeEnd = end
    }
  }
  total += rangeEnd - rangeStart + 1

  const years = Math.round(total / 12)
  return years >= 1 ? `${years} 年` : `${Math.max(total, 1)} 个月`
})

/** 自我评价最多铺两条，多了会把右卡撑得过高 */
const evaluations = computed(() =>
  (profile.value.evaluations || []).filter((item) => item.content).slice(0, 2),
)

const skillCount = computed(() => profile.value.skills?.length || 0)

/** 主页地址去掉协议头，卡片里只留一行能看懂的域名 */
const websiteLabel = computed(() =>
  String(profile.value.website || '')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, ''),
)

/** 邮箱复制反馈：点一下变成「已复制」，1.6 秒后复原 */
const copiedEmail = ref(false)
let copyTimer = null

async function copyEmail() {
  const text = profile.value.email
  if (!text) return

  let copied = false
  try {
    await navigator.clipboard.writeText(text)
    copied = true
  } catch {
    // 局域网 http 下没有 Clipboard API，退回临时 textarea
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      copied = document.execCommand('copy')
    } finally {
      document.body.removeChild(textarea)
    }
  }

  if (!copied) return
  copiedEmail.value = true
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copiedEmail.value = false
  }, 1600)
}

onUnmounted(() => clearTimeout(copyTimer))
</script>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

/* ---------- 区块标题 ---------- */

.section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.block__title {
  font-size: 18px;
}

.section__count {
  color: var(--text-3);
  font-size: 12px;
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
}

/* 卡片内部统一的「小标题 + 横线」样式 */
.card-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-head__label {
  color: var(--text-3);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
}

.card-head__rule {
  flex: 1;
  height: 1px;
  background: var(--border);
}

/* ---------- 资料卡 ---------- */

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-column: span 2;
  padding: 32px 22px 26px;
  text-align: center;
}

.profile__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  overflow: hidden;
  border-radius: 24px;
  background: var(--brand);
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  box-shadow:
    0 0 0 6px var(--brand-soft),
    0 14px 26px -18px rgba(19, 27, 58, 0.55);
}

.profile__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 姓名 + 工作年限：年限贴在名字右下角，用一道细线分隔 */
.profile__name-row {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.profile__name {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.profile__age {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding-bottom: 3px;
  color: var(--text-3);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
}

.profile__age::before {
  width: 1px;
  height: 10px;
  background: var(--border-strong);
  content: '';
}

.profile__tip {
  max-width: 100%;
  margin-top: 8px;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--brand-soft);
  color: var(--text-2);
  font-size: 12px;
  line-height: 1.5;
}

/* 目前状态：胶囊底色与圆点都跟着状态换色 */
.profile__status {
  --status-tone: var(--brand);

  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 3px 11px;
  border: 1px solid color-mix(in srgb, var(--status-tone) 28%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--status-tone) 9%, transparent);
  color: color-mix(in srgb, var(--status-tone) 78%, var(--text-1));
  font-size: 11.5px;
  font-weight: 600;
}

.profile__status::before {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--status-tone);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-tone) 16%, transparent);
  content: '';
}

/* 已离职-随时到岗 */
.profile__status--resigned {
  --status-tone: #2f9e6b;
}

/* 已离职-月内到岗 */
.profile__status--left {
  --status-tone: #0f8b8d;
}

/* 在职-考虑机会 */
.profile__status--open {
  --status-tone: #c07a15;
}

/* 在职-暂不考虑 */
.profile__status--closed {
  --status-tone: #64748b;
}

/* 性别 / 年龄 / 所在地：三列横排，垫一层淡色底 */
.profile__meta {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 22px;
  padding: 13px 0;
  border-radius: 12px;
  background: var(--brand-soft);
}

.profile__meta li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.profile__meta li + li {
  border-left: 1px solid var(--border);
}

.profile__label {
  color: var(--text-3);
  font-size: 10.5px;
  letter-spacing: 0.1em;
}

.profile__icon {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.85;
}

.profile__value {
  color: var(--text-1);
  font-size: 14.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* 联系方式：一列居中的小行，图标用品牌色 */
.profile__contacts {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.profile__contact {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  padding: 5px 8px;
  border-radius: 8px;
  color: var(--text-2);
  font-size: 12.5px;
  /* 卡片是居中排版，联系方式这一列统一靠左，别让邮箱文字居中 */
  text-align: left;
}

.profile__contact > svg {
  flex: none;
  width: 14px;
  height: 14px;
  fill: none;
  stroke: var(--brand);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.profile__contact-text {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 邮箱复制按钮：点一下变绿并显示「已复制」 */
.profile__copy {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-3);
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.profile__copy:hover {
  border-color: var(--brand);
  background: var(--brand-soft);
  color: var(--brand);
}

.profile__copy.is-done {
  border-color: color-mix(in srgb, #2f9e6b 30%, transparent);
  background: color-mix(in srgb, #2f9e6b 9%, transparent);
  color: #2f7d5c;
}

.profile__copy svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ---------- 简介卡 ---------- */

.intro {
  display: flex;
  flex-direction: column;
  grid-column: span 4;
  padding: 30px 32px;
}

.intro__evals {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 18px;
}

/* 评价用小色块包起来：浅品牌底 + 左侧一道细线 */
.intro__eval {
  padding: 13px 16px;
  border-left: 2px solid color-mix(in srgb, var(--brand) 55%, transparent);
  border-radius: 0 10px 10px 0;
  background: color-mix(in srgb, var(--brand) 6%, transparent);
}

.intro__eval-title {
  color: var(--brand-strong);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.intro__eval-text {
  margin-top: 5px;
  color: var(--text-2);
  font-size: 13px;
  line-height: 1.8;
}

/* 三项数字压在卡片底部，撑起整张卡的高度 */
.intro__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

/* 数字和单位排在同一行，别让「13 项技能」拆成两行 */
.intro__stats li {
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
}

.intro__stats li + li {
  padding-left: 16px;
  border-left: 1px solid var(--border);
}

.intro__stats strong {
  color: var(--text-1);
  font-size: 21px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.intro__stats span {
  color: var(--text-3);
  font-size: 11.5px;
  letter-spacing: 0.06em;
}

/* ---------- 技能 ---------- */

/* 单行最多三列，超过三个自动换到下一行 */
.skill-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.skill {
  padding: 22px 22px 24px;
}

.skill__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.skill__name {
  font-size: 15px;
  font-weight: 700;
}

.skill__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: var(--brand-soft);
  color: var(--brand-strong);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.skill__items {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 14px;
}

.skill__items .chip {
  height: 26px;
  padding: 0 11px;
  border-color: color-mix(in srgb, var(--brand) 22%, transparent);
  background: color-mix(in srgb, var(--brand) 8%, transparent);
  color: var(--brand-strong);
  font-size: 12.5px;
  font-weight: 500;
}

.skill__items .chip:hover {
  border-color: var(--brand);
  background: color-mix(in srgb, var(--brand) 16%, transparent);
}

/* ---------- 经历时间线 ---------- */

.timeline {
  grid-column: span 6;
  padding: 30px 32px;
}

.timeline__list {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.timeline__item {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  column-gap: 14px;
}

.timeline__period {
  justify-self: end;
  align-self: start;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--brand-soft);
  color: var(--text-2);
  font-size: 10.5px;
  line-height: 1.6;
  letter-spacing: 0.02em;
  text-align: center;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.timeline__content {
  position: relative;
  padding-left: 22px;
  border-left: 1px solid var(--border);
}

.timeline__dot {
  position: absolute;
  top: 12px;
  left: -5px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 0 4px var(--brand-soft);
}

.timeline__title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.55;
}

.timeline__org {
  margin-left: 8px;
  color: var(--text-2);
  font-size: 13px;
  font-weight: 500;
}

.timeline__role {
  margin-left: 8px;
  padding: 2px 11px;
  border-radius: 999px;
  background: var(--brand-soft);
  color: var(--text-2);
  font-size: 12px;
  font-weight: 500;
  vertical-align: 1px;
}

.timeline__desc {
  margin-top: 6px;
  font-size: 13.5px;
  line-height: 1.8;
}

/* ---------- 响应式 ---------- */

@media (max-width: 900px) {
  .profile,
  .intro,
  .timeline {
    grid-column: span 4;
  }

  .skill-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .about {
    gap: 36px;
  }

  .profile,
  .intro,
  .timeline {
    grid-column: span 1;
  }

  .profile {
    padding: 28px 18px 22px;
  }

  .intro {
    padding: 24px 20px;
  }

  .skill-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .timeline {
    padding: 24px 20px;
  }

  /* 一列放不下「日期 + 内容」，日期挪到内容上方 */
  .timeline__item {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 8px;
  }

  .timeline__period {
    justify-self: start;
    margin-left: 22px;
  }
}

/* ---------- 缺省状态 ---------- */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 420px;
  padding: 44px 24px;
  text-align: center;
}

.empty-state__title {
  color: var(--text-1);
  font-size: 16px;
  font-weight: 700;
}

.empty-state__desc {
  color: var(--text-3);
  font-size: 13px;
}

.empty-state__spinner {
  width: 26px;
  height: 26px;
  margin-bottom: 6px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: empty-spin 0.8s linear infinite;
}

@keyframes empty-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .empty-state {
    min-height: 320px;
    padding: 32px 18px;
  }
}

</style>
