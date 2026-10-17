# 个人网站镜像：Node 构建静态文件 + Nginx 托管并反向代理后端接口
#
# 构建：docker build -t fastapi-personal-website:1.0.0 .
# 运行：docker run -d --name personal-website -p 8090:80 \
#         --add-host=host.docker.internal:host-gateway \
#         -e API_UPSTREAM=http://host.docker.internal:8000 \
#         fastapi-personal-website:1.0.0
#
# —— 构建参数：默认值 = 官方源，网络受限时才需要覆盖 ——
#   NODE_IMAGE        构建阶段基础镜像（默认 node:26-alpine，2026-10 起为 LTS）
#   NGINX_IMAGE       运行阶段基础镜像（默认 nginx:1.30-alpine = stable）
#   NPM_REGISTRY      npm 源，国内可换 https://registry.npmmirror.com
#   VITE_API_BASE_URL 接口基址：默认 /api（相对路径 → 同源，由 Nginx 反代，天然无跨域）
#   VITE_APP_TITLE    站点名，留空则用代码里的默认值
#   VITE_PROFILE_ID   只展示后端某一个人的简历；留空 = 取第一个启用中的人
# ⚠️ 两个基础镜像的 ARG 必须写在第一个 FROM 之前，否则第二个 FROM 会解析成空值
ARG NODE_IMAGE=node:26-alpine
ARG NGINX_IMAGE=nginx:1.30-alpine

FROM ${NODE_IMAGE} AS build

# FROM 之后需要重新声明才能在这个阶段使用
ARG NPM_REGISTRY=https://registry.npmjs.org
ARG VITE_API_BASE_URL=/api
ARG VITE_APP_TITLE=
ARG VITE_PROFILE_ID=

WORKDIR /app

# 先装依赖，源码变动时可复用这一层缓存（用 package-lock.json 保证可复现）
COPY package.json package-lock.json ./
RUN npm ci --registry "$NPM_REGISTRY" --no-audit --no-fund

COPY . .

# Vite 构建时从环境变量读取接口地址与站点信息
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_APP_TITLE=$VITE_APP_TITLE \
    VITE_PROFILE_ID=$VITE_PROFILE_ID
RUN npm run build

# ---------------------------- 运行阶段 ----------------------------
FROM ${NGINX_IMAGE}

# 只让 envsubst 替换 API_UPSTREAM，避免动到 nginx 自身的 $uri / $host 等变量
ENV API_UPSTREAM=http://host.docker.internal:8000 \
    NGINX_ENVSUBST_FILTER=^API_UPSTREAM$

# 官方 nginx 镜像的入口脚本会在启动时把 templates/*.template 渲染到 conf.d/
COPY nginx.conf /etc/nginx/templates/default.conf.template

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# 用 busybox wget 探活，省去额外安装 curl
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
