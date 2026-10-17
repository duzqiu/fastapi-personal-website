<template>
  <div class="container about">
    <SectionHeading eyebrow="关于" title="关于我" />

    <!-- 顶排：左边资料卡，右边简介卡（等高于左侧） -->
    <section class="bento">
      <aside class="profile card" v-reveal>
        <div class="profile__avatar">
          <img v-if="profile.avatar" :src="profile.avatar" :alt="profile.name" />
          <template v-else>{{ profile.monogram }}</template>
        </div>

        <p class="profile__name">{{ profile.name }}</p>
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
            <span class="profile__label">
              <svg class="profile__icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3.4" />
                <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
              </svg>
              性别
            </span>
            <span class="profile__value">{{ profile.gender }}</span>
          </li>
          <li>
            <span class="profile__label">
              <svg class="profile__icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
                <path d="M8 3.5v4M16 3.5v4M3.5 10.5h17" />
              </svg>
              年龄
            </span>
            <span class="profile__value">{{ profile.age }}</span>
          </li>
          <li>
            <span class="profile__label">
              <svg class="profile__icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 20.5s6-5.6 6-10.3a6 6 0 1 0-12 0c0 4.7 6 10.3 6 10.3Z" />
                <circle cx="12" cy="10" r="2.3" />
              </svg>
              所在地
            </span>
            <span class="profile__value">{{ profile.location }}</span>
          </li>
        </ul>

        <!-- 联系方式并进资料卡：一列淡色行，点一下就能发信 / 拨号 / 打开主页 -->
        <ul v-if="profile.email || profile.phone || profile.website" class="profile__contacts">
          <li v-if="profile.email">
            <a class="profile__contact" :href="`mailto:${profile.email}`">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
                <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
              </svg>
              <span :title="profile.email">{{ profile.email }}</span>
            </a>
          </li>
          <li v-if="profile.phone">
            <a class="profile__contact" :href="telHref">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M8.5 3.8 11 8.6l-2.2 2.2a12 12 0 0 0 4.4 4.4l2.2-2.2 4.8 2.5v3.2a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 6a2 2 0 0 1 2-2.2Z"
                />
              </svg>
              <span :title="profile.phone">{{ profile.phone }}</span>
            </a>
          </li>
          <li v-if="profile.website">
            <a class="profile__contact" :href="profile.website" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M3.5 12h17M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5S14.2 18.2 12 20.5c-2.2-2.3-3.3-5.1-3.3-8.5S9.8 5.8 12 3.5Z" />
              </svg>
              <span :title="profile.website">{{ websiteLabel }}</span>
            </a>
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

    <!-- 工作经历 -->
    <section v-if="profile.experience?.length" class="section" v-reveal>
      <div class="section__head">
        <h2 class="block__title">工作经历</h2>
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

    <!-- 教育经历：与工作经历共用同一套时间线 -->
    <section v-if="profile.education?.length" class="section" v-reveal>
      <div class="section__head">
        <h2 class="block__title">教育经历</h2>
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
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import ProjectCard from '@/components/ProjectCard.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { useSiteStore } from '@/stores/site'

const site = useSiteStore()
const { profile, projects } = storeToRefs(site)

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

/** 自我评价最多铺两条，多了会把右卡撑得过高 */
const evaluations = computed(() =>
  (profile.value.evaluations || []).filter((item) => item.content).slice(0, 2),
)

const skillCount = computed(() => profile.value.skills?.length || 0)

/** 手机号里带空格，tel: 链接得去掉才拨得出去 */
const telHref = computed(
  () => `tel:${String(profile.value.phone || '').replace(/\s+/g, '')}`,
)

/** 主页地址去掉协议头，卡片里只留一行能看懂的域名 */
const websiteLabel = computed(() =>
  String(profile.value.website || '')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, ''),
)
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

.profile__name {
  margin-top: 20px;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 0.02em;
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
  display: inline-flex;
  align-items: center;
  gap: 4px;
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
  transition: background 0.2s ease, color 0.2s ease;
}

.profile__contact:hover {
  background: var(--brand-soft);
  color: var(--text-1);
}

.profile__contact svg {
  flex: none;
  width: 14px;
  height: 14px;
  fill: none;
  stroke: var(--brand);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.profile__contact span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
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

</style>
