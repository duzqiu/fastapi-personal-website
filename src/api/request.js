import axios from 'axios'

/**
 * 统一的 axios 实例。
 *
 * - baseURL 默认 `/api`，配合 vite.config.js 里的代理打到 FastAPI 后端；
 * - 响应拦截器直接把 `data` 抖出来，业务里 `await fetchProfile()` 拿到的就是数据本身；
 * - 出错时统一抛一句能看懂的 message（后端约定用 `detail` 字段，FastAPI 默认也是它）。
 */
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const detail = error?.response?.data?.detail
    const message =
      (typeof detail === 'string' && detail) ||
      error?.message ||
      '网络异常，请稍后再试'
    return Promise.reject(new Error(message))
  },
)

export default request
