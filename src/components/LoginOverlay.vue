<template>
  <div class="login-overlay">
    <div class="overlay-content">
      <n-flex vertical align="center" justify="center" :size="24">
        <n-icon size="48" :depth="3">
          <LockClosedOutline />
        </n-icon>
        <n-h2>需要登录才能查看详细数据</n-h2>
        <n-p depth="3" style="text-align: center">
          登录后即可使用完整的数据分析功能，包括访问统计、地理分布、设备分析等
        </n-p>
        <n-button type="primary" size="large" @click="handleLogin">立即登录</n-button>
      </n-flex>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NFlex, NH2, NP, NIcon } from 'naive-ui'
import { LockClosedOutline } from '@vicons/ionicons5'
import { useRouter } from 'vue-router'

const router = useRouter()
const emit = defineEmits(['login'])

const handleLogin = () => {
  router.push({
    path: '/auth',
    query: { redirect: router.currentRoute.value.fullPath },
  })
  emit('login')
}
</script>

<style scoped>
.login-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--n-color-modal-mask), 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  animation: fadeIn 0.3s ease-out;
}

.overlay-content {
  background: var(--n-color);
  padding: 48px;
  border-radius: 16px;
  box-shadow: var(--n-box-shadow);
  max-width: 90%;
  width: 400px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
