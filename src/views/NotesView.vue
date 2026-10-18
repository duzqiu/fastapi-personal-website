<template>
  <div class="container page">
    <SectionHeading
      eyebrow="笔记"
      title="随手记的东西"
      desc="平时踩过的坑和攒下来的小结论，写得比较随意。"
    />

    <!-- 还没有数据时的缺省页 -->
    <EmptyState
      v-reveal
      title="暂无笔记"
      desc="还没写，等攒够几篇再放上来。"
    />
  </div>
</template>

<script setup>
import EmptyState from '@/components/EmptyState.vue'
import SectionHeading from '@/components/SectionHeading.vue'
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
