<template>
  <div class="home">
    <n-card class="home-card">
      <n-flex vertical size="large">
        <n-h1>
          <n-text type="primary" class="gradient-text">更短的链接，更大的世界</n-text>
        </n-h1>
        <n-p depth="2">一键生成短链接，轻松分享，快速传播，精准分析</n-p>
        <LinkCreator />
        <n-divider />
        <RecentLinks />
      </n-flex>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { NH1, NP, NCard, NFlex, NDivider, NText } from 'naive-ui'
import LinkCreator from '@/components/LinkCreator.vue'
import RecentLinks from '@/components/RecentLinks.vue'
</script>

<style scoped>
.home {
  animation: fadeIn 0.5s ease-out;
}

.home-card {
  padding: 20px;
}

.n-card {
  flex-grow: 1;
}

.gradient-text {
  background: linear-gradient(45deg, #00b09b 0%, #96c93d 99%, #96c93d 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.5rem;
  font-weight: bold;
}
</style>
