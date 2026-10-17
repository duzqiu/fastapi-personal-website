import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'

/** 站点名：浏览器标题用它（可用 .env 里的 VITE_APP_TITLE 覆盖） */
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || '奔波儿灞'

/** 导航左上角显示的名字，只影响这一处，不参与浏览器标题 */
export const BRAND_NAME = '奔波儿灞'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: '首页' },
  },
  {
    // 除了首页，其余页面都按需加载
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于我' },
  },
  {
    path: '/notes',
    name: 'notes',
    component: () => import('@/views/NotesView.vue'),
    meta: { title: '笔记' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // `behavior: 'instant'` 覆盖 html 上的 scroll-behavior: smooth ——
  // 切 tab 时直接从当前滚动位置回到顶部，不要滑那一下，
  // 否则顶部进度条会跟着从中间缩到最左边
  scrollBehavior: () => ({ top: 0, behavior: 'instant' }),
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ${APP_TITLE}` : APP_TITLE
})

export default router
