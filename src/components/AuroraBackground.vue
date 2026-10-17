<template>
  <!-- 全站背景：两团同色系的柔光，卡片透过去才有玻璃感；纯装饰、不接收点击 -->
  <div class="aurora" aria-hidden="true">
    <span class="aurora__blob aurora__blob--top" />
    <span class="aurora__blob aurora__blob--bottom" />
  </div>
</template>

<style scoped>
.aurora {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.aurora__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}

.aurora__blob--top {
  top: -30vw;
  left: 50%;
  width: 92vw;
  height: 92vw;
  transform: translateX(-50%);
  background: radial-gradient(circle, var(--aurora-color) 0%, transparent 62%);
}

.aurora__blob--bottom {
  right: -22vw;
  bottom: -34vw;
  width: 64vw;
  height: 64vw;
  background: radial-gradient(circle, var(--aurora-color) 0%, transparent 65%);
  opacity: 0.75;
}
</style>
