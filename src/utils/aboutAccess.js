import { ref } from 'vue'

import { fetchAboutAccess } from '@/api/site'

/**
 * 「关于我」是否需要密码。
 *
 * 默认 true：接口没取到之前先保守地当成需要密码，避免短暂绕过。
 * 路由守卫和导航点击都会先调 loadAboutAccess()，后台关闭密码后直接放行。
 */
export const aboutPasswordEnabled = ref(true)

let pending = null

export function loadAboutAccess() {
  if (pending) return pending

  pending = (async () => {
    try {
      const data = await fetchAboutAccess()
      aboutPasswordEnabled.value = Boolean(data?.password_enabled)
      // 后台关闭密码时，清掉旧的解锁状态；以后重新开启需要重新验证
      if (!aboutPasswordEnabled.value) {
        sessionStorage.removeItem('about-unlocked')
      }
    } catch {
      // 接口异常时保持默认值，宁可多要一次密码
    } finally {
      pending = null
    }
  })()

  return pending
}
