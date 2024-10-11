<template>
  <div class="home">
    <n-card>
      <n-flex vertical size="large">
        <n-h1>
          <n-text type="primary">更短的链接，更准的营销</n-text>
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
  max-width: 800px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.n-card {
  flex-grow: 1;
}
</style>
