import { ref } from 'vue'

/**
 * 深 / 浅主题。
 *
 * 状态放在模块作用域（不在某个组件里）—— 顶栏那枚开关、别处想读主题的地方拿到的都是同一份。
 * 主题只落到 `<html data-theme="...">` 上，具体颜色全在 styles/index.scss 的两套变量里。
 */

const STORAGE_KEY = 'site-theme'

/** 'light' | 'dark' */
const theme = ref('light')
let initialized = false

function apply(value) {
  theme.value = value
  document.documentElement.dataset.theme = value
  // 顺手把浏览器地址栏的颜色也带上（移动端 Safari / Chrome 有效）
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', value === 'dark' ? '#070a16' : '#f6f7fc')
}

/** 初始主题：地址栏 ?theme=dark|light 优先（截图 / 分享特定主题的用），其次存过的，最后跟系统 */
export function initTheme() {
  if (initialized) return
  initialized = true

  const fromUrl = new URLSearchParams(window.location.search).get('theme')
  if (fromUrl === 'dark' || fromUrl === 'light') {
    apply(fromUrl)
    return
  }

  const saved = localStorage.getItem(STORAGE_KEY)
  const prefersDark =
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  apply(saved === 'dark' || saved === 'light' ? saved : prefersDark ? 'dark' : 'light')
}

export function useTheme() {
  function toggleTheme() {
    const next = theme.value === 'dark' ? 'light' : 'dark'
    apply(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return { theme, toggleTheme }
}
