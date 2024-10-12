<template>
  <div class="home">
    <n-card class="home-card">
      <n-flex vertical size="large">
        <n-h1>
          <n-text type="primary" class="gradient-text">更短的链接，更准的营销</n-text>
        </n-h1>
        <n-p>轻松创建短链接，提高您的在线营销效率</n-p>
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
  max-width: 1000px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
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
