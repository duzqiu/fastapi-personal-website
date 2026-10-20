import request from './request'

/**
 * 个人网站 · 简历信息的对外接口（由 fastapi-admin-backend 提供，**无需登录**）。
 *
 * 后端把「一个人的整份简历」合并成一个接口，挂载在 `/api/v1` 下：
 *
 *   GET /api/v1/resume/public/profiles?personal_info_id=1
 *   GET /api/v1/resume/public/profiles?limit=1       不指定就取启用的第一个人
 *
 * 返回的是**数组**，一条就是一份完整简历：
 *
 *   personal_info            姓名 / 头像 / 性别 / 生日 / 手机 / 邮箱 / 城市 / 求职意向 / 备注
 *   educations[]             教育经历
 *   work_experiences[]       工作经历（每条自带 projects[]）
 *   evaluations[]            自我评价
 *   skill_tags[]             技能标签（category + tags[]）
 *
 * 字段映射与兜底在 stores/site.js 里做，这里只负责发请求。
 */

/** 后端 API 前缀是 /api/v1，axios 实例的 baseURL 是 /api，所以这里从 /v1 开始写 */
const RESUME_PUBLIC = '/v1/resume/public/profiles'

/**
 * 拉整份简历
 * @param {{ personal_info_id?: number, limit?: number }} params
 *        personal_info_id 只取指定的人；不传则取启用中的（limit 控制人数）
 * @returns {Promise<Array>} 简历数组（结构见文件头注释）
 */
export function fetchResumeProfiles(params) {
  return request.get(RESUME_PUBLIC, params ? { params } : undefined)
}
