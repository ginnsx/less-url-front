<template>
  <div class="auth-view">
    <n-card class="auth-card">
      <n-tabs
        v-model:value="activeTab"
        size="large"
        justify-content="space-evenly"
        type="line"
        animated
      >
        <n-tab-pane name="login" tab="登录">
          <login-form @login-success="handleLoginSuccess" />
        </n-tab-pane>
        <n-tab-pane name="register" tab="注册">
          <register-form @login-success="handleLoginSuccess" />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NTabs, NTabPane } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import LoginForm from '@/components/LoginForm.vue'
import RegisterForm from '@/components/RegisterForm.vue'

const activeTab = ref('login')
const router = useRouter()
const route = useRoute()

const handleLoginSuccess = () => {
  try {
    const redirectPath = (route.query.redirect as string) || '/'
    router.push(redirectPath)
  } catch (error) {
    console.error('登录失败:', error)
  }
}
</script>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>
