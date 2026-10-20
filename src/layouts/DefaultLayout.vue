<template>
  <AuroraBackground />

  <div class="layout">
    <header class="header">
      <!-- 顶部细进度条：随滚动走，纯装饰但很「活」 -->
      <span class="header__progress" :style="{ transform: `scaleX(${progress})` }" />

      <div class="container header__bar">
        <RouterLink class="brand" :to="{ name: 'home' }">
          <!-- 和标签页 favicon 用同一个图标，改一处两边都变 -->
          <span class="brand__mark">
            <img :src="brandIcon" alt="" width="34" height="34" />
          </span>
          <span class="brand__copy">
            <span class="brand__name">{{ BRAND_NAME }}</span>
            <span v-if="site.welcome.blessing" class="brand__blessing">
              {{ site.welcome.blessing }}
            </span>
          </span>
        </RouterLink>

        <nav class="nav">
          <template v-for="item in navItems" :key="item.name">
            <button
              v-if="item.name === 'about'"
              type="button"
              class="nav__link nav__link--button"
              :class="{ 'router-link-active': route.name === 'about' }"
              @click="openAboutGate"
            >
              {{ item.label }}
            </button>
            <RouterLink v-else class="nav__link" :to="{ name: item.name }">
              {{ item.label }}
            </RouterLink>
          </template>
        </nav>

        <div class="header__actions">
          <ThemeToggle />
        </div>
      </div>
    </header>

    <main class="layout__main">
      <RouterView v-slot="{ Component }">
        <!-- ⚠️ 显式给 duration：不给的话 Vue 靠 transitionend 收尾，一旦那个事件没来
             （无头截图、标签页不可见之类），`page-enter-from` 会一直挂在根元素上、
             整页停在 opacity: 0，看着就像「白屏」。给个固定时长就有兜底了。 -->
        <Transition name="page" mode="out-in" :duration="{ enter: 220, leave: 120 }">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <footer class="footer">
      <div class="container footer__inner">
        <!-- 署名固定写死，不跟后端的姓名走 -->
        <p class="footer__line">2026 duzqiu</p>
        <p class="footer__line">本站使用 {{ site.profile.stack }} 构建</p>
      </div>
    </footer>

    <!-- 关于我访问密码 -->
    <Transition name="gate">
      <div v-if="gate.visible" class="gate" @click.self="closeGate">
        <form
          class="gate__card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gate-title"
          @submit.prevent="submitGate"
        >
          <button
            type="button"
            class="gate__close"
            aria-label="关闭"
            @click="closeGate"
          >
            ×
          </button>

          <div class="gate__head">
            <span class="gate__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
                <path d="M8 10V7.5a4 4 0 0 1 8 0V10M12 14v3" />
              </svg>
            </span>
            <div>
              <h3 id="gate-title" class="gate__title">打开「关于我」</h3>
              <p class="gate__desc">输入访问密码后继续浏览</p>
            </div>
          </div>

          <label class="gate__label" for="gate-password">访问密码</label>
          <input
            id="gate-password"
            ref="gateInput"
            v-model="gate.password"
            class="gate__input"
            :class="{ 'is-error': gate.error }"
            type="text"
            maxlength="64"
            autocomplete="off"
            spellcheck="false"
            placeholder="至少 4 位，支持中文"
            @input="gate.error = ''"
          />
          <p v-if="gate.error" class="gate__error">{{ gate.error }}</p>
          <p class="gate__hint">验证后当前标签页内有效，关闭标签页后需重新输入。</p>
          <p class="gate__hint">
            不知道密码？可联系
            <span class="gate__mail">duzqiu@outlook.com</span>
          </p>

          <div class="gate__actions">
            <button type="button" class="btn btn--ghost" @click="closeGate">取消</button>
            <button type="submit" class="btn btn--primary" :disabled="gate.checking">
              {{ gate.checking ? '验证中…' : '打开' }}
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { verifyAboutPassword } from '@/api/site'
import AuroraBackground from '@/components/AuroraBackground.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { BRAND_NAME } from '@/router'
import { useSiteStore } from '@/stores/site'
import {
  aboutPasswordEnabled,
  loadAboutAccess,
} from '@/utils/aboutAccess'

const ABOUT_UNLOCK_KEY = 'about-unlocked'

const site = useSiteStore()
const route = useRoute()
const router = useRouter()
const gateInput = ref(null)
const gate = reactive({
  visible: false,
  password: '',
  error: '',
  checking: false,
})

/**
 * 站标直接引 public 里那份 favicon，别写成模板里的静态 src ——
 * 静态 src 会被 Vite 当成资源导入并内联成 data URI，换图后要重启才更新。
 * 换图标时把版本号 +1，顺便把浏览器那份旧缓存顶掉。
 */
const brandIcon = `${import.meta.env.BASE_URL}favicon.svg?v=3`

const navItems = [
  { name: 'home', label: '首页' },
  { name: 'about', label: '关于我' },
  { name: 'notes', label: '笔记' },
]

/** 顶部进度条：0~1 */
const progress = ref(0)

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(1, window.scrollY / max) : 0
}

async function openAboutGate() {
  await loadAboutAccess()
  if (
    !aboutPasswordEnabled.value ||
    sessionStorage.getItem(ABOUT_UNLOCK_KEY) === '1'
  ) {
    router.push({ name: 'about' })
    return
  }
  gate.visible = true
  gate.password = ''
  gate.error = ''
  nextTick(() => gateInput.value?.focus())
}

function closeGate() {
  gate.visible = false
  gate.password = ''
  gate.error = ''
  gate.checking = false
  if (route.query.gate === 'about') {
    router.replace({ name: 'home' })
  }
}

async function submitGate() {
  const password = gate.password
  if (!password) {
    gate.error = '请输入访问密码'
    return
  }
  if (password.length < 4) {
    gate.error = '密码至少 4 位'
    return
  }

  gate.checking = true
  gate.error = ''
  try {
    await verifyAboutPassword(password)
    sessionStorage.setItem(ABOUT_UNLOCK_KEY, '1')
    gate.visible = false
    gate.password = ''
    await router.push({ name: 'about' })
  } catch (error) {
    gate.error = error.message || '密码不正确'
  } finally {
    gate.checking = false
  }
}

// 直接访问 /about 被路由守卫送回首页时，自动弹出密码框
watch(
  () => route.query.gate,
  (value) => {
    if (value === 'about') {
      openAboutGate()
      router.replace({ name: 'home' })
    }
  },
  { immediate: true },
)

// 弹窗打开时锁住背景滚动
watch(
  () => gate.visible,
  (visible) => {
    document.body.style.overflow = visible ? 'hidden' : ''
  },
)

function onKeydown(event) {
  if (event.key === 'Escape' && gate.visible) {
    closeGate()
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

// 一进站就把资料和欢迎语拉一次：拿到了用后端的，拿不到就留着本地占位
site.loadWelcome()
site.loadProfile()
site.loadProjects()
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ---------- 顶栏：玻璃 + 吸顶 ---------- */

.header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg) 78%, transparent);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
}

.header__progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: var(--brand);
  transform-origin: left center;
  transform: scaleX(0);
}

.header__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: var(--header-height);
}

.brand {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}

.brand__mark {
  display: inline-flex;
  flex: none;
  width: 34px;
  height: 34px;
  /* 圆角和底色都在 icon 自己身上，这里只负责尺寸和对齐 */
  overflow: hidden;
  border-radius: var(--radius-sm);
}

.brand__mark img {
  display: block;
  width: 100%;
  height: 100%;
}

.brand__copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.brand__name {
  font-size: 16px;
  line-height: 1.2;
}

/* 祝福语：灰色，字号与首页副标题一致 */
.brand__blessing {
  max-width: 240px;
  margin-top: 1px;
  overflow: hidden;
  color: var(--text-3);
  font-size: clamp(12px, 1.1vw, 15px);
  font-weight: 400;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 导航：胶囊容器 + 胶囊式的当前项 */
.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.nav__link {
  padding: 6px 16px;
  border-radius: 999px;
  color: var(--text-2);
  font-size: 14px;
  transition: color 0.2s ease, background 0.2s ease;
}

.nav__link:hover {
  color: var(--text-1);
  background: var(--brand-soft);
}

/* 「关于我」是密码入口，用 button 保持与链接相同外观 */
.nav__link--button {
  border: 0;
  background: none;
  font-family: inherit;
  cursor: pointer;
}

.nav__link.router-link-active {
  background: var(--brand);
  color: #fff;
  font-weight: 600;
}

.header__actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 10px;
}

/* ---------- 关于我密码弹窗 ---------- */

.gate {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.gate__card {
  position: relative;
  width: min(100%, 390px);
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: 0 30px 70px -30px rgba(15, 23, 42, 0.5);
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.gate__close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--text-3);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.gate__close:hover {
  background: var(--brand-soft);
  color: var(--text-1);
}

.gate__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 24px;
}

.gate__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: var(--brand-soft);
  color: var(--brand);
}

.gate__icon svg {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.gate__title {
  color: var(--text-1);
  font-size: 17px;
  font-weight: 700;
}

.gate__desc {
  margin-top: 3px;
  color: var(--text-3);
  font-size: 12.5px;
}

.gate__label {
  display: block;
  margin-top: 20px;
  color: var(--text-2);
  font-size: 12px;
  font-weight: 600;
}

.gate__input {
  width: 100%;
  height: 44px;
  margin-top: 8px;
  padding: 0 14px;
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text-1);
  font: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.gate__input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--brand-soft);
}

.gate__input.is-error {
  border-color: #d14343;
}

.gate__input.is-error:focus {
  box-shadow: 0 0 0 3px rgba(209, 67, 67, 0.12);
}

.gate__error {
  margin-top: 8px;
  color: #d14343;
  font-size: 12px;
}

.gate__hint {
  margin-top: 8px;
  color: var(--text-3);
  font-size: 11.5px;
  line-height: 1.6;
}

.gate__mail {
  color: var(--brand);
  font-weight: 600;
  user-select: all;
}

.gate__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.gate-enter-active,
.gate-leave-active {
  transition: opacity 0.2s ease;
}

.gate-enter-from,
.gate-leave-to {
  opacity: 0;
}

.gate-enter-from .gate__card,
.gate-leave-to .gate__card {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

.layout__main {
  flex: 1;
  padding: 34px 0 60px;
}

/* ---------- 页脚 ---------- */

.footer {
  /* 页脚尽量往后退：不铺底色、不做模糊、也不画分割线，只留两行很淡的字 */
  background: none;
}

.footer__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px 24px;
  padding-top: 14px;
  padding-bottom: 16px;
}

.footer__line {
  /* text-3 再压到七成不透明，退到几乎只剩个存在感 */
  color: color-mix(in srgb, var(--text-3) 70%, transparent);
  font-size: 12.5px;
  letter-spacing: 0.02em;
}

/* 路由切换：只淡入淡出，不做位移 —— 否则新页面从下面 10px 处升上来，
   顶部标题会跟着跳一下，切 tab 时看着像整页在晃 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

@media (max-width: 780px) {
  .brand__name,
  .brand__blessing {
    display: none;
  }

  .nav__link {
    padding: 6px 11px;
    font-size: 13px;
  }

  .footer__inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}

/* tab 变多了，窄屏就让导航自己横向滚，别把顶栏撑破 */
@media (max-width: 560px) {
  .nav {
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .nav::-webkit-scrollbar {
    display: none;
  }

  .nav__link {
    flex: none;
    padding: 6px 9px;
    font-size: 12.5px;
  }
}
</style>
