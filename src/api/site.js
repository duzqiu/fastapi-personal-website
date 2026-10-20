import request from './request'

/** 首页欢迎语（公开） */
export function fetchSiteWelcome() {
  return request.get('/v1/site/welcome')
}

/** 查询「关于我」是否需要密码（公开） */
export function fetchAboutAccess() {
  return request.get('/v1/site/about/access')
}

/** 校验「关于我」访问密码（公开） */
export function verifyAboutPassword(password) {
  return request.post('/v1/site/about/verify', { password })
}
