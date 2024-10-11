<template>
  <div class="link-creator">
    <n-form ref="formRef" :label-width="80" :model="model" :rules="rules">
      <n-form-item path="longUrl" label="长链接">
        <n-input
          v-model:value="model.longUrl"
          size="large"
          round
          show-count
          placeholder="输入长链接..."
          :count-graphemes="countGraphemes"
          :maxlength="maxUrlLength"
          @keydown.enter.prevent
        />
      </n-form-item>

      <n-collapse-transition :show="showAdvancedSettings">
        <n-form-item label="高级设置">
          <n-grid :cols="2" :x-gap="12">
            <n-form-item-gi path="customAlias">
              <n-input
                v-model:value="model.customAlias"
                size="large"
                round
                show-count
                placeholder="自定义别名（最多6个字符）"
                :maxlength="6"
              />
            </n-form-item-gi>
            <n-form-item-gi path="expirationTime">
              <n-date-picker
                v-model:value="model.expirationTime"
                type="datetime"
                size="large"
                clearable
                placeholder="选择过期时间"
                :is-date-disabled="disablePreviousDate"
                :is-time-disabled="disablePreviousTime"
              />
            </n-form-item-gi>
          </n-grid>
        </n-form-item>
      </n-collapse-transition>

      <n-form-item>
        <n-button @click="toggleAdvancedSettings" ghost size="medium">
          {{ showAdvancedSettings ? '隐藏高级设置' : '显示高级设置' }}
        </n-button>
      </n-form-item>

      <n-row :gutter="[0, 24]">
        <n-col :span="24">
          <div style="display: flex; justify-content: flex-end">
            <n-button
              :disabled="!model.longUrl"
              round
              type="primary"
              @click="handleCreateLink"
              :loading="loading"
            >
              生成短链
            </n-button>
          </div>
        </n-col>
      </n-row>
    </n-form>
    <n-result
      v-if="shortUrl"
      status="success"
      title="短链接已生成"
      :description="copied ? '已复制' : '点击下方链接复制'"
    >
      <template #footer>
        <n-button
          size="large"
          :type="copied ? 'success' : 'info'"
          :bordered="false"
          ghost
          round
          @click.stop="copyToClipboard"
        >
          <template #icon>
            <n-icon :component="copied ? CheckmarkCircle : Copy" />
          </template>
          {{ shortUrl }}
        </n-button>
        <QRCode :value="shortUrl" :size="200" />
      </template>
    </n-result>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useLinksStore } from '@/stores/links'
import {
  NForm,
  NFormItem,
  NFormItemGi,
  NInput,
  NButton,
  NResult,
  NRow,
  NCol,
  NDatePicker,
  NGrid,
  NCollapseTransition,
  NIcon,
  useMessage,
  type FormInst,
  type FormRules,
  type FormItemRule,
} from 'naive-ui'
import GraphemeSplitter from 'grapheme-splitter'
import type { ValidateError } from 'async-validator'
import QRCode from './QRCode.vue'
import { CheckmarkCircle, Copy } from '@vicons/ionicons5'
import dayjs from 'dayjs'

const formRef = ref<FormInst | null>(null)

const model = reactive({
  longUrl: '',
  customAlias: '',
  expirationTime: null as number | null,
})

const resetForm = () => {
  model.longUrl = ''
  model.customAlias = ''
  model.expirationTime = null
}

const showAdvancedSettings = ref(false)

const toggleAdvancedSettings = () => {
  showAdvancedSettings.value = !showAdvancedSettings.value
}

const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const rules: FormRules = {
  longUrl: [
    {
      validator(_rule: FormItemRule, value: string) {
        if (!isValidUrl(value)) {
          return new Error('请输入有效链接')
        }
        return true
      },
      trigger: ['input'],
    },
  ],
  customAlias: [
    {
      validator(_rule: FormItemRule, value: string) {
        if (value && value.length > 6) {
          return new Error('自定义别名不能超过6个字符')
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],
}

const spliter = new GraphemeSplitter()
const countGraphemes = (value: string) => spliter.countGraphemes(value)
const maxUrlLength = ref(200)

const shortUrl = ref('')
const loading = ref(false)
const linksStore = useLinksStore()
const message = useMessage()

const handleCreateLink = async (e: Event) => {
  e.preventDefault()
  loading.value = true
  formRef.value
    ?.validate()
    .then(async () => {
      try {
        await createLink()
        message.success('短链接创建成功')
      } catch (error) {
        console.warn('Failed to create link:', error)
        message.error('创建短链接失败，请稍后重试')
      }
    })
    .catch((errors) => {
      const errorMessage = (errors[0][0] as ValidateError)?.message || '表单验证失败，请检查输入'
      console.warn(errorMessage)
      message.error(errorMessage)
    })
    .finally(() => {
      loading.value = false
    })

  async function createLink() {
    const newLink = await linksStore.createLink(
      model.longUrl,
      model.customAlias || null,
      model.expirationTime || null
    )
    shortUrl.value = newLink.shortUrl
    resetForm()
  }
}

const copied = ref(false)

const copyToClipboard = () => {
  navigator.clipboard.writeText(shortUrl.value).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 15000)
    message.success('短链接已复制到剪贴板')
  })
}

const disablePreviousDate = (ts: number): boolean => {
  return dayjs(ts).isBefore(dayjs()) && !dayjs(ts).isToday()
}

const disablePreviousTime = () => {
  return {
    isHourDisabled: (hour: number) => {
      return hour < dayjs().hour()
    },
    isMinuteDisabled: (minute: number) => {
      return minute < dayjs().minute() + 5
    },
  }
}
</script>
