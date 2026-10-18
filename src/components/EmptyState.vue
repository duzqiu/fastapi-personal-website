<template>
  <div class="empty card">
    <svg class="empty__art" viewBox="0 0 240 240" aria-hidden="true">
      <circle cx="120" cy="120" r="104" fill="var(--empty-bg)" />

      <!-- 箱子底下的投影，压一下才不像浮着 -->
      <ellipse cx="120" cy="200" rx="56" ry="7" fill="var(--empty-4)" opacity="0.4" />

      <!-- 两片向两侧翻开的箱盖 -->
      <polygon points="120,106 56,124 12,98 76,80" fill="var(--empty-2)" />
      <polygon points="120,106 184,124 228,98 164,80" fill="var(--empty-3)" />

      <!-- 箱口内侧（最深） -->
      <polygon points="120,106 56,124 120,142 184,124" fill="var(--empty-4)" />

      <!-- 箱体：左亮右暗 -->
      <polygon points="56,124 120,142 120,196 56,178" fill="var(--empty-2)" />
      <polygon points="120,142 184,124 184,178 120,196" fill="var(--empty-3)" />

      <!-- 飘起来的纸 -->
      <g transform="rotate(-14 56 58)">
        <rect
          x="28"
          y="36"
          width="56"
          height="44"
          rx="5"
          fill="var(--empty-paper)"
          stroke="var(--empty-3)"
          stroke-width="0.8"
        />
        <rect x="28" y="36" width="56" height="9" rx="5" fill="var(--empty-2)" />
      </g>
      <g transform="rotate(12 172 62)">
        <rect
          x="152"
          y="44"
          width="42"
          height="36"
          rx="5"
          fill="var(--empty-paper)"
          stroke="var(--empty-3)"
          stroke-width="0.8"
        />
      </g>
    </svg>

    <p class="empty__title">{{ title }}</p>
    <p v-if="desc" class="empty__desc">{{ desc }}</p>

    <!-- 有需要时由使用方塞操作按钮（如「重新加载」） -->
    <div v-if="$slots.default" class="empty__actions">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '暂无数据' },
  desc: { type: String, default: '' },
})
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  padding: 44px 24px;
  text-align: center;

  /* 插图的几档灰：浅色主题下一路往白里走，深色主题在下面覆盖 */
  --empty-bg: #e9edf5;
  --empty-paper: #ffffff;
  --empty-2: #dbe2ec;
  --empty-3: #c6d0e0;
  --empty-4: #b3bfd3;
}

/* 深色主题下换成半透明白，否则一团浅灰浮在黑底上 */
html[data-theme='dark'] .empty {
  --empty-bg: rgba(255, 255, 255, 0.04);
  --empty-paper: rgba(255, 255, 255, 0.16);
  --empty-2: rgba(255, 255, 255, 0.1);
  --empty-3: rgba(255, 255, 255, 0.065);
  --empty-4: rgba(144, 153, 221, 0.38);
}

.empty__art {
  width: 208px;
  height: 208px;
  margin-bottom: 18px;
}

.empty__title {
  font-size: 16px;
  font-weight: 700;
}

.empty__desc {
  margin-top: 6px;
  color: var(--text-3);
  font-size: 13px;
}

.empty__actions {
  margin-top: 18px;
}

@media (max-width: 640px) {
  .empty {
    min-height: 320px;
    padding: 32px 18px;
  }

  .empty__art {
    width: 168px;
    height: 168px;
  }
}
</style>
