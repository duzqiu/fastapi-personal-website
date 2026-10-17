<template>
  <header class="heading">
    <div class="heading__main">
      <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
      <h2 class="heading__title">
        <slot name="title">{{ title }}</slot>
      </h2>
      <p v-if="desc" class="heading__desc muted">{{ desc }}</p>
    </div>
    <div v-if="$slots.actions" class="heading__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  desc: { type: String, default: '' },
})
</script>

<style scoped>
.heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

/* 主栏吃满剩余宽度，简介才有机会铺到右边（.heading__desc 默认仍限 620px） */
.heading__main {
  flex: 1 1 auto;
  min-width: 0;
}

.heading__title {
  margin-top: 10px;
  font-size: clamp(22px, 3.2vw, 30px);
}

.heading__desc {
  margin-top: 10px;
  max-width: 620px;
  font-size: 14.5px;
}

.heading__actions {
  flex: none;
}

@media (max-width: 640px) {
  .heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
