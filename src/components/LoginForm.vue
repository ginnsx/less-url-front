<template>
  <n-form
    ref="formRef"
    :model="model"
    :rules="rules"
    size="large"
    :show-label="false"
    :style="{ maxWidth: '640px' }"
    @keydown.enter.prevent="handleSubmit"
  >
    <n-form-item path="username" :feedback="emailFeedback" :validation-status="emailValidateStatus">
      <n-auto-complete
        v-model:value.trim="model.username"
        :options="options"
        :get-show="(value: string) => value.endsWith('@')"
        :input-props="{
          autocomplete: 'username',
        }"
        placeholder="邮箱"
        clearable
        @update:value="checkEmail"
      />
    </n-form-item>
    <n-form-item path="password" v-if="!useVerifyCode">
      <n-input
        v-model:value="model.password"
        type="password"
        :input-props="{
          autocomplete: 'current-password',
        }"
        show-password-on="click"
        placeholder="密码"
      />
    </n-form-item>
    <n-form-item path="verifyCode" v-else>
      <n-input-group>
        <n-input v-model:value="model.verifyCode" placeholder="验证码" />
        <n-button
          type="primary"
          ghost
          :disabled="isGettingCode"
          @click="handleGetVerifyCode"
          :loading="isGettingCode"
        >
          {{ isGettingCode ? `${countdown}s` : '获取验证码' }}
        </n-button>
      </n-input-group>
    </n-form-item>
    <n-flex vertical :size="12">
      <n-flex justify="space-between" align="center">
        <n-checkbox v-model:checked="useVerifyCode">使用验证码登录</n-checkbox>
        <n-button text type="primary" @click="handleForgotPassword">忘记密码？</n-button>
      </n-flex>
      <n-button type="primary" @click="handleSubmit" :loading="isLoading" block> 登录 </n-button>
    </n-flex>
  </n-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NButton,
  NCheckbox,
  NFlex,
  NAutoComplete,
  useMessage,
} from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { debounce } from 'lodash-es'

const emit = defineEmits(['login-success'])

const formRef = ref<FormInst | null>(null)
const message = useMessage()
const authStore = useAuthStore()

const model = reactive({
  username: '',
  password: '',
  verifyCode: '',
})

const useVerifyCode = ref(false)
const isLoading = ref(false)
const isGettingCode = ref(false)
const countdown = ref(60)
const emailCheckStatus = ref<'unchecked' | 'valid' | 'invalid' | 'error'>('unchecked')
const emailFeedback = ref('')

const emailValidateStatus = computed(() => {
  if (emailCheckStatus.value === 'invalid') return 'error'
  if (emailCheckStatus.value === 'error') return 'warning'
  if (emailCheckStatus.value === 'valid') return 'success'
  return undefined
})

const rules: FormRules = {
  username: [
    { key: 'username', required: true, message: '请输入邮箱地址', trigger: ['blur', 'input'] },
    { key: 'username', type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'input'] },
  ],
  password: [
    { key: 'password', required: true, message: '请输入密码', trigger: ['blur', 'input'] },
  ],
  verifyCode: [
    { key: 'verifyCode', required: true, message: '请输入验证码', trigger: ['blur', 'input'] },
    {
      key: 'verifyCode',
      type: 'string',
      min: 6,
      max: 6,
      message: '验证码长度应为 6 位',
      trigger: ['blur', 'input'],
    },
  ],
}

const options = computed(() => {
  return ['@gmail.com', '@outlook.com', '@hotmail.com', '@163.com', '@qq.com'].map((suffix) => {
    const prefix = model.username.split('@')[0]
    return {
      label: prefix + suffix,
      value: prefix + suffix,
    }
  })
})

const doCheckEmail = async (value: string) => {
  emailCheckStatus.value = 'unchecked'
  emailFeedback.value = ''
  model.verifyCode = ''
  model.password = ''
  isGettingCode.value = false
  formRef.value?.validate(
    async (errors) => {
      if (!errors) {
        try {
          const exists = await authStore.checkEmail(value.trim())
          if (!exists) {
            emailFeedback.value = '邮箱未注册'
            emailCheckStatus.value = 'invalid'
          } else {
            emailFeedback.value = ''
            emailCheckStatus.value = 'valid'
          }
        } catch (error) {
          emailCheckStatus.value = 'error'
          console.error('Email check failed:', error)
          emailFeedback.value = '邮箱检查失败，请稍后重试'
        }
      }
    },
    (rule) => rule?.key === 'username'
  )
}

const checkEmail = debounce(doCheckEmail, 1000)

const handleGetVerifyCode = async () => {
  isGettingCode.value = true
  const result = await authStore.sendVerificationCode(model.username, 'LOGIN')
  if (result === true) {
    message.success('验证码已发送，请查收邮箱')
    startCountdown()
  } else {
    message.error(result || '获取验证码失败，请稍后重试')
    isGettingCode.value = false
  }
}

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(timer)
      isGettingCode.value = false
    }
  }, 1000)
}

const handleSubmit = (e: MouseEvent | KeyboardEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      isLoading.value = true
      const success = await authStore.login(
        model.username,
        useVerifyCode.value ? undefined : model.password,
        useVerifyCode.value ? model.verifyCode : undefined
      )
      if (success) {
        message.success('登录成功')
        emit('login-success')
      } else {
        message.error('登录失败，请检查邮箱和密码是否正确')
      }

      isLoading.value = false
    }
  })
}

const handleForgotPassword = () => {
  // 实现忘记密码的逻辑
  message.info('忘记密码功能开发中...')
}
</script>

<style scoped>
.n-form {
  animation: fadeIn 0.5s ease-out;
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
