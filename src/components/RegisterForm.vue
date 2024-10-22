<template>
  <n-form
    ref="formRef"
    :model="model"
    :rules="rules"
    size="large"
    :show-label="false"
    :style="{ maxWidth: '640px' }"
  >
    <n-form-item path="email" :feedback="emailFeedback" :validation-status="emailValidateStatus">
      <n-auto-complete
        v-model:value="model.email"
        :options="options"
        :get-show="(value: string) => value.endsWith('@')"
        :input-props="{
          autocomplete: 'username',
        }"
        placeholder="邮箱"
        clearable
        :disabled="step === 2"
        @update:value="checkEmail"
      />
    </n-form-item>
    <n-form-item path="verifyCode" v-if="emailCheckStatus === 'valid'">
      <n-input-group>
        <n-input
          v-model:value="model.verifyCode"
          placeholder="验证码"
          @keydown.enter.prevent="verifyEmail"
          :disabled="step === 2"
        />
        <n-button
          type="primary"
          ghost
          :disabled="isGettingCode || step === 2"
          @click="handleGetVerifyCode"
          :loading="isGettingCode"
        >
          {{ isGettingCode ? `${countdown}s` : '获取验证码' }}
        </n-button>
      </n-input-group>
    </n-form-item>
    <template v-if="step === 1">
      <n-button
        v-if="isVerifyCodeValid"
        type="primary"
        @click="verifyEmail"
        :loading="isLoading"
        block
      >
        验证邮箱
      </n-button>
    </template>
    <template v-else>
      <n-form-item path="nickname">
        <n-input
          v-model:value="model.nickname"
          :input-props="{
            autocomplete: 'disabled',
          }"
          placeholder="用户名"
          @keydown.enter.prevent="handleSubmit"
        />
      </n-form-item>
      <n-form-item path="password">
        <n-input
          v-model:value="model.password"
          type="password"
          show-password-on="click"
          :input-props="{
            autocomplete: 'new-password',
          }"
          placeholder="密码"
          @input="checkPasswordStrength"
          @keydown.enter.prevent="handleSubmit"
        />
      </n-form-item>
      <n-form-item path="confirmPassword">
        <n-input
          v-model:value="model.confirmPassword"
          type="password"
          show-password-on="click"
          :input-props="{
            autocomplete: 'new-password',
          }"
          placeholder="确认密码"
          @keydown.enter.prevent="handleSubmit"
        />
      </n-form-item>
      <n-flex vertical :size="12">
        <n-progress
          type="line"
          :percentage="passwordStrength"
          :status="passwordStrengthStatus"
          :height="8"
          :border-radius="4"
        >
          {{ passwordStrengthText }}
        </n-progress>
        <n-button type="primary" @click="handleSubmit" :loading="isLoading" block> 注册 </n-button>
        <n-button @click="changeEmail" v-if="!isLoading" block> 更换邮箱 </n-button>
      </n-flex>
    </template>
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
  NFlex,
  NProgress,
  NAutoComplete,
  useMessage,
  NText,
} from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['register-success'])

const formRef = ref<FormInst | null>(null)
const message = useMessage()
const authStore = useAuthStore()

const model = reactive({
  email: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  verifyCode: '',
})

const isLoading = ref(false)
const isGettingCode = ref(false)
const countdown = ref(60)
const passwordStrength = ref(0)
const step = ref(1)
const emailCheckStatus = ref<'unchecked' | 'valid' | 'invalid' | 'error'>('unchecked')
const emailFeedback = ref('')

const emailValidateStatus = computed(() => {
  if (emailCheckStatus.value === 'invalid') return 'error'
  if (emailCheckStatus.value === 'error') return 'warning'
  if (emailCheckStatus.value === 'valid') return 'success'
  return undefined
})

const isVerifyCodeValid = computed(() => {
  return model.verifyCode.length === 6
})

const rules: FormRules = {
  email: [
    { key: 'email', required: true, message: '请输入邮箱地址', trigger: ['blur', 'input'] },
    { key: 'email', type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'input'] },
  ],
  nickname: [
    { key: 'nickname', required: true, message: '请输入用户名', trigger: ['blur', 'input'] },
    {
      key: 'nickname',
      min: 3,
      max: 20,
      message: '用户名长度应在3-20个字符之间',
      trigger: ['blur', 'input'],
    },
  ],
  password: [
    { key: 'password', required: true, message: '请输入密码', trigger: ['blur', 'input'] },
    { key: 'password', min: 8, message: '密码长度至少为8个字符', trigger: ['blur', 'input'] },
  ],
  confirmPassword: [
    { key: 'confirmPassword', required: true, message: '请确认密码', trigger: ['blur', 'input'] },
    {
      key: 'confirmPassword',
      validator: (rule, value) => value === model.password,
      message: '两次输入的密码不一致',
      trigger: ['blur', 'input'],
    },
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

const checkEmail = async (value: string) => {
  emailCheckStatus.value = 'unchecked'
  emailFeedback.value = ''
  formRef.value?.validate(
    async (errors) => {
      if (!errors) {
        try {
          const exist = await authStore.checkEmail(value)
          if (exist) {
            emailFeedback.value = '该邮箱已被注册'
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
    (rule) => rule?.key === 'email'
  )
}

const handleGetVerifyCode = async () => {
  isGettingCode.value = true

  const result = await authStore.sendVerificationCode(model.email, 'REGISTER')
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

const options = computed(() => {
  return ['@gmail.com', '@outlook.com', '@hotmail.com', '@163.com', '@qq.com'].map((suffix) => {
    const prefix = model.email.split('@')[0]
    return {
      label: prefix + suffix,
      value: prefix + suffix,
    }
  })
})

const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 20) return '非常弱'
  if (passwordStrength.value < 40) return '弱'
  if (passwordStrength.value < 60) return '一般'
  if (passwordStrength.value < 80) return '强'
  return '非常强'
})

const passwordStrengthStatus = computed(() => {
  if (passwordStrength.value < 40) return 'error'
  if (passwordStrength.value < 60) return 'warning'
  if (passwordStrength.value < 80) return 'success'
  return 'info'
})

const checkPasswordStrength = (password: string) => {
  const hasLowerCase = /[a-z]/.test(password)
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_\-=+~`[\]{}\\|;:'"?/<>,.]/.test(password)
  const length = password.length

  let strength = 0

  // 基础分数：长度
  if (length >= 8) strength += 10
  if (length >= 12) strength += 10
  if (length >= 16) strength += 10
  if (length >= 20) strength += 10

  // 字符类型
  const types = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar]
  const typeCount = types.filter(Boolean).length
  strength += typeCount * 10

  // 额外奖励
  if (typeCount >= 3 && length >= 8) strength += 10
  if (typeCount === 4 && length >= 12) strength += 10
  if (typeCount === 4 && length >= 20) strength += 10

  // 惩罚：如果密码只包含字母或数字，降低分数
  if (typeCount === 1 && (hasLowerCase || hasUpperCase || hasNumber)) {
    strength = Math.max(0, strength - 20)
  }

  // 确保分数在0-100之间
  passwordStrength.value = Math.min(Math.max(strength, 0), 100) + 10
}

const verifyEmail = (e: MouseEvent | KeyboardEvent) => {
  e.preventDefault()
  formRef.value?.validate(
    async (errors) => {
      if (!errors) {
        isLoading.value = true
        try {
          const success = await authStore.verifyEmailCode(model.email, model.verifyCode)
          if (success) {
            step.value = 2
            // 设置用户名
            model.nickname = model.email.split('@')[0]
          }
        } finally {
          isLoading.value = false
        }
      }
    },
    (rule) => rule?.key === 'email' || rule?.key === 'verifyCode'
  )
}

const changeEmail = () => {
  step.value = 1
  model.nickname = ''
  model.password = ''
  model.confirmPassword = ''
  model.verifyCode = ''
  passwordStrength.value = 0
  isGettingCode.value = false
  emailCheckStatus.value = 'unchecked'
}

const handleSubmit = (e: MouseEvent | KeyboardEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      if (passwordStrength.value < 60) {
        message.error('密码强度太低，请使用更复杂的密码')
        return
      }
      try {
        isLoading.value = true
        const success = await authStore.register(
          model.email,
          model.nickname,
          model.password,
          model.verifyCode
        )
        if (success) {
          message.success('注册成功并已登录')
          emit('register-success')
        } else {
          message.error('注册失败，请稍后重试')
        }
      } finally {
        isLoading.value = false
      }
    }
  })
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
