<template>
  <n-flex vertical align="center" justify="space-between" style="height: 100%">
    <n-qr-code ref="qrCode" :value="value" :size="size" error-correction-level="Q" />
    <n-button @click.stop="handleDownloadQRCode">下载二维码</n-button>
  </n-flex>
</template>

<script setup lang="ts">
import { NQrCode, NButton, NFlex } from 'naive-ui'
import { useTemplateRef } from 'vue'
import type { ComponentPublicInstance } from 'vue'

defineProps<{
  value: string
  size?: number
}>()

const qrCodeRef = useTemplateRef<ComponentPublicInstance | null>('qrCode')

const handleDownloadQRCode = () => {
  const canvas = qrCodeRef.value?.$el?.querySelector('canvas')
  if (canvas instanceof HTMLCanvasElement) {
    const url = canvas.toDataURL()
    const a = document.createElement('a')
    a.download = `lessurl-QRCode-${new Date().toISOString()}.png`
    a.href = url
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}
</script>
