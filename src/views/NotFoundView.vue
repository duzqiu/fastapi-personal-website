<template>
  <div class="container not-found">
    <div class="not-found__card card" v-reveal>
      <p class="not-found__code accent">404</p>
      <h1 class="not-found__title">这页走丢了</h1>
      <p class="not-found__text muted">
        链接可能写错了，或者这个页面已经挪走。
      </p>
      <div class="not-found__actions">
        <RouterLink class="btn btn--primary" :to="{ name: 'home' }">
          回到首页
        </RouterLink>
        <RouterLink class="btn btn--ghost" :to="{ name: 'about' }">
          看看关于我
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.not-found__card {
  width: 100%;
  max-width: 520px;
  padding: 56px 36px;
  border-radius: var(--radius-lg);
  text-align: center;
  background: color-mix(in srgb, var(--brand) 8%, var(--surface));
}

.not-found__code {
  font-size: clamp(64px, 14vw, 96px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
}

.not-found__title {
  margin-top: 14px;
  font-size: 22px;
}

.not-found__text {
  margin: 12px 0 26px;
  font-size: 14px;
}

.not-found__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}
</style>
