<template>
  <!-- 外层槽位只负责占住收起时的位置，展开的卡片脱离文档流往下长，不挤动下面的卡片 -->
  <div class="project-slot" :style="slotStyle">
    <component
      ref="cardEl"
      :is="project.url ? 'a' : 'div'"
      class="project card card--hover"
      :class="{ 'is-expanded': expanded, 'is-clipped': overflow }"
      :href="project.url || undefined"
      :target="project.url ? '_blank' : undefined"
      :rel="project.url ? 'noreferrer' : undefined"
    >
    <!-- 顶部：编号在左、时间在右，和下面的大标题分层 -->
    <div class="project__top">
      <span v-if="index" class="project__index">{{ index }}</span>
      <span v-if="project.period" class="project__period">{{ project.period }}</span>
    </div>

    <h3 class="project__name">{{ project.name }}</h3>
    <p v-if="project.company" class="project__company">{{ project.company }}</p>

    <div ref="bodyEl" class="project__body" @click.stop>
      <div class="project__block project__block--soft">
        <p class="project__label">项目介绍</p>
        <p class="project__text">{{ project.desc }}</p>
      </div>

      <div v-if="project.duty" class="project__block project__block--soft">
        <p class="project__label">项目职责</p>
        <p class="project__text">{{ project.duty }}</p>
      </div>

      <div v-if="project.achievement" class="project__block project__block--soft">
        <p class="project__label">项目业绩</p>
        <p class="project__text">{{ project.achievement }}</p>
      </div>
    </div>

    <!-- 正文有最大高度，超了才在右下角给个上下箭头 -->
    <button
      v-if="overflow"
      class="project__toggle"
      type="button"
      :aria-expanded="expanded"
      :aria-label="expanded ? '收起' : '展开'"
      :title="expanded ? '收起' : '展开'"
      @click.stop.prevent="toggle"
    >
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
        <path
          d="m6 9 6 6 6-6"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <ul class="project__tags">
      <li v-for="tag in project.tags || []" :key="tag" class="project__tag">
        {{ tag }}
      </li>
    </ul>
    </component>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

defineProps({
  project: { type: Object, required: true },
  index: { type: [Number, String], default: '' },
})

const expanded = ref(false)
/** 正文超过最大高度时才显示按钮 */
const overflow = ref(false)
const bodyEl = ref(null)
const cardEl = ref(null)

/** 收起状态下量到的卡片高度，展开时用它把槽位钉住 */
const slotHeight = ref(0)
const slotStyle = computed(() =>
  expanded.value && slotHeight.value ? { height: `${slotHeight.value}px` } : null,
)

let observer = null

function measure() {
  // 展开后高度就是全部内容，量了也没意义（保持按钮在）
  if (expanded.value) return
  const el = bodyEl.value
  if (!el) return
  overflow.value = el.scrollHeight > el.clientHeight + 1
}

function toggle() {
  if (!expanded.value) {
    // 展开前先记住收起时的卡片高度，槽位照着它占位，下面的卡片不会被推走
    slotHeight.value = cardEl.value?.offsetHeight || 0
  }
  expanded.value = !expanded.value
}

watch(expanded, async (value) => {
  if (value) return
  await nextTick()
  measure()
})

onMounted(async () => {
  await nextTick()
  measure()

  // 宽度变了行数就变，高度也就变了，得重新判一次
  if (typeof ResizeObserver !== 'undefined' && bodyEl.value) {
    observer = new ResizeObserver(measure)
    observer.observe(bodyEl.value)
  }

  // 字体晚一点加载完，行高会变，再量一次
  document.fonts?.ready.then(measure)
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
/* 槽位固定占一格：卡片展开时脱流往下长，位置仍由它守住 */
.project-slot {
  position: relative;
  grid-column: span 3;
}

/* 所有卡片一样宽：6 格里各占 3 格，一行两张 */
.project {
  /* 收起时正文最多露出 6 行（字号 12.5 × 行高 1.75） */
  --project-body-max: calc(6 * 1.75 * 12.5px);

  display: flex;
  flex-direction: column;
  min-height: 320px;
  padding: 24px;
}

/* 顶部一行：编号胶囊 + 时间 */
.project__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  color: var(--text-3);
  letter-spacing: 0.08em;
}

.project__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  background: var(--brand-soft);
  color: var(--brand-strong);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.project__period {
  font-variant-numeric: tabular-nums;
}

.project__name {
  margin-top: 14px;
  font-size: 20px;
  line-height: 1.35;
}

.project__company {
  margin-top: 4px;
  color: var(--text-3);
  font-size: 12.5px;
}

/*
 * 正文限高：卡片整体高度跟着封顶，标签始终留在底部；
 * 超出的部分靠右下角箭头展开。
 */
.project__body {
  position: relative;
  max-height: var(--project-body-max);
  margin-top: 4px;
  overflow: hidden;
}

/*
 * 展开：卡片整体脱流，从收起时的高度往下长；
 * 原位置由外层槽位占住，所以下面的卡片不会被挤走，展开部分像浮层压在它们上面。
 */
.project.is-expanded {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 10;
  /* 浮在别的卡片上时底色要够实，文字才不会叠在一起 */
  background: color-mix(in srgb, var(--bg) 62%, var(--surface-hover));
  box-shadow: 0 26px 60px -30px rgba(19, 27, 58, 0.5);
}

.project.is-expanded .project__body {
  max-height: none;
  overflow: visible;
}

/* 被截断时底部压一层渐隐，避免文字被生硬切断 */
.project.is-clipped:not(.is-expanded) .project__body::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 40px;
  background: linear-gradient(to bottom, transparent, var(--surface) 78%);
  content: '';
  pointer-events: none;
}

.project__block {
  margin-top: 14px;
}

/* 职责 / 业绩各垫一块浅底，和「介绍」拉开层次 */
.project__block--soft {
  padding: 11px 14px 13px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand) 6%, transparent);
}

.project__label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text-3);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.project__label::before {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--brand);
  content: '';
}

.project__block--soft .project__label {
  color: var(--brand-strong);
}

.project__text {
  margin-top: 6px;
  color: var(--text-3);
  font-size: 12.5px;
  line-height: 1.75;
  /* 项目描述 / 职责 / 业绩都保留后台输入的换行 */
  white-space: pre-line;
}

/* 右下角那个展开/收起箭头 */
.project__toggle {
  position: absolute;
  right: 22px;
  bottom: 22px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-3);
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.project__toggle:hover {
  border-color: var(--border-strong);
  background: var(--surface-hover);
  color: var(--brand);
}

.project__toggle svg {
  transition: transform 0.25s ease;
}

.project.is-expanded .project__toggle svg {
  transform: rotate(180deg);
}

.project__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  padding-top: 18px;
  /* 给右下角的箭头留位，标签别压到它下面 */
  padding-right: 46px;
}

.project__tag {
  padding: 3px 11px;
  border: 1px solid color-mix(in srgb, var(--brand) 20%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand) 6%, transparent);
  font-size: 12px;
  color: var(--brand-strong);
}

@media (max-width: 900px) {
  .project-slot {
    grid-column: span 4;
  }
}

@media (max-width: 640px) {
  .project-slot {
    grid-column: span 1;
  }

  .project {
    min-height: auto;
    padding: 20px;
  }
}
</style>
