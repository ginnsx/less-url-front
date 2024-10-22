<template>
  <div class="link-creator">
    <n-form
      ref="formRef"
      :model="model"
      :rules="rules"
      label-placement="left"
      label-width="auto"
      require-mark-placement="right-hanging"
      size="large"
    >
      <n-form-item path="originalUrl" label="原始链接">
        <n-input
          v-model:value="model.originalUrl"
          size="large"
          round
          show-count
          placeholder="请输入需要缩短的链接"
          :count-graphemes="countGraphemes"
          :maxlength="maxUrlLength"
          @keydown.enter.prevent="handleCreateLink"
        />
      </n-form-item>

      <n-collapse-transition :show="showAdvancedSettings">
        <n-form-item label="高级设置" class="advanced-settings">
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
            <n-form-item-gi path="expiresAt">
              <n-date-picker
                v-model:value="model.expiresAt"
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
        <n-button @click="toggleAdvancedSettings" ghost size="medium" class="toggle-button">
          {{ showAdvancedSettings ? '隐藏高级设置' : '显示高级设置' }}
        </n-button>
      </n-form-item>

      <n-row :gutter="[0, 24]">
        <n-col :span="24">
          <n-flex justify="end">
            <n-button
              class="create-button"
              :disabled="!model.originalUrl"
              round
              type="primary"
              @click="handleCreateLink"
              :loading="loading"
            >
              创建短链接
            </n-button>
          </n-flex>
        </n-col>
      </n-row>
    </n-form>
    <n-result
      v-if="shortUrl"
      status="success"
      title="您成功创建了一条短链接"
      :description="copied ? '已复制' : '点击下方链接复制'"
      style="padding: 20px"
    >
      <template #footer>
        <n-flex justify="center" align="center">
          <n-icon class="inline" size="20" depth="1" color="#0e7a0d" :component="CheckmarkSharp" />
          <n-text class="inline" depth="1" strong>
            {{ shortUrl }}
          </n-text>
          <n-tag
            class="inline copy-btn"
            :type="copied ? 'success' : 'info'"
            :bordered="false"
            ghost
            size="medium"
            @click.stop="copyToClipboard"
          >
            <template #icon>
              <n-icon :component="copied ? CheckmarkDoneSharp : CopySharp" />
            </template>
          </n-tag>
        </n-flex>
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
  NText,
  NFlex,
  NTag,
  useMessage,
  type FormInst,
  type FormRules,
  type FormItemRule,
} from 'naive-ui'
import GraphemeSplitter from 'grapheme-splitter'
import type { ValidateError } from 'async-validator'
import QRCode from './QRCode.vue'
import { CheckmarkDoneSharp, CopySharp, CheckmarkSharp } from '@vicons/ionicons5'
import dayjs from 'dayjs'

const emit = defineEmits(['create'])

const formRef = ref<FormInst | null>(null)

const model = reactive({
  originalUrl: '',
  customAlias: '',
  expiresAt: null as number | null,
})

const resetForm = () => {
  model.originalUrl = ''
  model.customAlias = ''
  model.expiresAt = null
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
  originalUrl: [
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
        message.success('短链接已生成')
        emit('create')
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
      model.originalUrl,
      model.customAlias || null,
      model.expiresAt || null
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
    }, 5000)
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
<style scoped>
.link-creator {
  margin-bottom: 20px;
  transition: all 0.3s ease;
  border-radius: 15px;
}

.create-button {
  border: none;
  transition: all 0.3s ease;
}

.create-button:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(255, 154, 158, 0.4);
}

.toggle-button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.toggle-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.advanced-settings {
  animation: fadeIn 0.5s ease-out;
}
.inline {
  margin-left: 0px;
  margin-right: 0px;
  padding: 0px;
}
.copy-btn {
  cursor: pointer;
  background-color: var(--n-color-checkable);
  padding: 0px;
  margin: 0px;
}
</style>
