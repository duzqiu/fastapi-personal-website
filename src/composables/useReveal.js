/**
 * 滚动进场指令：`v-reveal`（可选延迟毫秒 `v-reveal="120"`）。
 *
 * 用 IntersectionObserver 而不是 scroll 事件 —— 不占主线程、也不用自己算位置。
 * 进过视口就把指令摘掉（`unobserve`）、并保留 `.is-visible`，只播一次。
 */

const SUPPORTED =
  typeof window !== 'undefined' && 'IntersectionObserver' in window

const observers = new WeakMap()

export const vReveal = {
  mounted(el, binding) {
    el.classList.add('reveal')

    const delay = Number(binding.value) || 0
    if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`)

    // 不支持（或关了动效）就直接显示，别把内容藏住
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!SUPPORTED || reduced) {
      el.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      // 露出来一点点就触发，上下各留一点余量
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(el)
    observers.set(el, observer)
  },

  unmounted(el) {
    observers.get(el)?.disconnect()
    observers.delete(el)
  },
}
