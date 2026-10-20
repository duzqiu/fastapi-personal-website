<template>
  <section class="hero">
    <!-- 名字背后两团光，纯装饰 -->
    <span class="hero__halo" aria-hidden="true" />
    <span class="hero__halo hero__halo--core" aria-hidden="true" />

    <div class="hero__inner">
      <!-- 主标题 / 副标题来自后台「首页欢迎语」 -->
      <h1 class="hero__title">{{ welcome.title }}</h1>
      <p class="hero__subtitle">{{ welcome.subtitle }}</p>
      <span class="hero__rule" aria-hidden="true" />
    </div>
  </section>
</template>

<script setup>
import { storeToRefs } from 'pinia'

import { useSiteStore } from '@/stores/site'

const site = useSiteStore()
const { welcome } = storeToRefs(site)
</script>

<style scoped>
/*
 * 首页只留一屏展示：一行字 + 一道细线，其余全部留白。
 * 高度按「视口 - 顶栏 - main 上下内边距 - 页脚」算，正好一屏不出滚动条。
 */
.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-height) - 147px);
  min-height: calc(100dvh - var(--header-height) - 147px);
  padding: 24px 20px;
  overflow: hidden;
  isolation: isolate;
}

/* 外层散得开，内层亮一点，名字压上去才有层次 */
.hero__halo {
  position: absolute;
  inset: 0;
  z-index: -1;
  width: min(880px, 92vw);
  height: min(880px, 92vw);
  margin: auto;
  border-radius: 50%;
  background: radial-gradient(circle, var(--aurora-color) 0%, transparent 66%);
  filter: blur(24px);
  animation: breathe 9s ease-in-out infinite;
}

.hero__halo--core {
  width: min(420px, 62vw);
  height: min(420px, 62vw);
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--brand) 22%, transparent) 0%,
    transparent 68%
  );
  filter: blur(44px);
  animation-duration: 7s;
  animation-direction: reverse;
}

.hero__inner {
  /* 不加这条时宽度按 nowrap 标题的 max-content 撑开，窄屏上会顶出容器被裁 */
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero__title {
  max-width: min(100%, 980px);
  margin: 0;
  color: var(--text-1);
  /* 字号跟着视口走；标题可在后台修改，过长时允许自然换行 */
  font-size: clamp(22px, 7.2vw, 70px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  text-align: center;
  white-space: normal;
  /*
   * 淡入和位移拆成两条动画：位移要「快而入位」，所以用前段就冲到底的缓动；
   * 透明度要是也用这条曲线，0.2 秒就到 80% 了，眼睛基本看不出在渐显。
   * 所以透明度单独走 1.15s 的缓出，等路由切换那 0.22s 过完再开始。
   */
  animation:
    hero-fade 1.15s 0.1s ease-out both,
    hero-rise 0.9s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* 渐变字：老浏览器不认 background-clip:text 就退回纯色，别把字弄没了 */
@supports (-webkit-background-clip: text) or (background-clip: text) {
  .hero__title {
    background: linear-gradient(
      180deg,
      var(--text-1) 0%,
      color-mix(in srgb, var(--text-1) 45%, var(--brand)) 64%,
      var(--brand) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}

/* 副标题：灰色小字，比大标题晚半拍浮上来 */
.hero__subtitle {
  margin: clamp(10px, 1.4vw, 16px) 0 0;
  color: var(--text-3);
  font-size: clamp(12px, 1.1vw, 15px);
  font-weight: 500;
  letter-spacing: 0.04em;
  text-align: center;
  white-space: pre-line;
  animation:
    hero-fade 1.15s 0.28s ease-out both,
    hero-rise 0.9s 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero__rule {
  display: block;
  width: min(240px, 44vw);
  height: 1px;
  margin-top: clamp(22px, 3vw, 38px);
  background: linear-gradient(90deg, transparent, var(--brand), transparent);
  transform-origin: center;
  /* 等文字淡到一半再拉线，出场顺序上有个先后 */
  animation: draw 0.9s 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes hero-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes hero-rise {
  from {
    transform: translateY(18px);
  }
  to {
    transform: none;
  }
}

@keyframes draw {
  from {
    opacity: 0;
    transform: scaleX(0);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.07);
    opacity: 1;
  }
}

/* 页脚在 780px 以下折成竖排两行（见 DefaultLayout），高度要多留一截 */
@media (max-width: 780px) {
  .hero {
    min-height: calc(100vh - var(--header-height) - 175px);
    min-height: calc(100dvh - var(--header-height) - 175px);
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 20px 16px;
  }

  /* 手机上标题字号再收一档 */
  .hero__title {
    font-size: clamp(20px, 8vw, 34px);
  }

  .hero__subtitle {
    max-width: 100%;
    line-height: 1.6;
  }
}
</style>
