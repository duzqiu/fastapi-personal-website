import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { vReveal } from '@/composables/useReveal'
import { initTheme } from '@/composables/useTheme'

import '@/styles/index.scss'

// 先把主题落到 <html data-theme>，避免首屏白闪一下
initTheme()

createApp(App)
  // 滚动进场：模版里写 v-reveal（可选延迟毫秒）
  .directive('reveal', vReveal)
  .use(createPinia())
  .use(router)
  .mount('#app')
