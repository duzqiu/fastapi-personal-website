<template>
  <button
    class="toggle"
    type="button"
    :aria-label="isDark ? '切换到浅色主题' : '切换到深色主题'"
    :title="isDark ? '切换到浅色主题' : '切换到深色主题'"
    @click="toggleTheme"
  >
    <span class="toggle__icon" :class="{ 'is-dark': isDark }">
      <!-- 太阳 / 月亮，手写 SVG，省一个图标库 -->
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle
          v-if="!isDark"
          cx="12"
          cy="12"
          r="4.6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
        />
        <g
          v-if="!isDark"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
        >
          <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2" />
          <path d="M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6" />
        </g>
        <path
          v-else
          d="M20.2 14.4A8.4 8.4 0 1 1 9.6 3.8a6.8 6.8 0 0 0 10.6 10.6Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
const isDark = computed(() => theme.value === 'dark')
</script>

<style scoped>
.toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-2);
  cursor: pointer;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: color 0.2s ease, border-color 0.2s ease;
}

.toggle:hover {
  color: var(--brand);
  border-color: var(--brand);
}

.toggle__icon {
  display: inline-flex;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.toggle__icon.is-dark {
  transform: rotate(-18deg);
}
</style>
