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
          <span class="brand__name">{{ BRAND_NAME }}</span>
        </RouterLink>

        <nav class="nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            class="nav__link"
            :to="{ name: item.name }"
          >
            {{ item.label }}
          </RouterLink>
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
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

import AuroraBackground from '@/components/AuroraBackground.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { BRAND_NAME } from '@/router'
import { useSiteStore } from '@/stores/site'

const site = useSiteStore()

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

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))

// 一进站就把资料拉一次：拿到了用后端的，拿不到就留着本地占位
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

.brand__name {
  font-size: 16px;
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
  .brand__name {
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
