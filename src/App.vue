<template>
  <n-loading-bar-provider>
    <n-message-provider>
      <n-notification-provider>
        <n-config-provider :theme="theme" :locale="zhCN" :date-locale="dateZhCN">
          <n-layout class="layout">
            <n-layout-header bordered class="header">
              <div class="header-content">
                <router-link to="/" class="logo-link">
                  <n-text>LessURL</n-text>
                </router-link>
                <div class="header-right">
                  <n-menu mode="horizontal" :options="menuOptions" :value="activeKey" />
                  <n-button circle @click="toggleTheme">
                    <template #icon>
                      <n-icon size="18">
                        <sunny-outline v-if="isDarkTheme" />
                        <moon-outline v-else />
                      </n-icon>
                    </template>
                  </n-button>
                </div>
              </div>
            </n-layout-header>
            <n-layout-content content-style="padding: 24px; flex-grow: 1;">
              <router-view></router-view>
            </n-layout-content>
            <n-layout-footer bordered class="footer">
              <n-text>LessURL © {{ new Date().getFullYear() }}</n-text>
            </n-layout-footer>
          </n-layout>
        </n-config-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-loading-bar-provider>
  <n-back-top :right="100" />
</template>

<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  NLoadingBarProvider,
  NNotificationProvider,
  NConfigProvider,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NMenu,
  NText,
  NMessageProvider,
  NButton,
  NIcon,
  NBackTop,
  darkTheme,
  lightTheme,
} from 'naive-ui'
import { RouterLink } from 'vue-router'
import { SunnyOutline, MoonOutline } from '@vicons/ionicons5'
import { zhCN, dateZhCN } from 'naive-ui'

const isDarkTheme = ref(false)
const theme = computed(() => (isDarkTheme.value ? darkTheme : lightTheme))

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
}

const route = useRoute()
const activeKey = computed(() => route.name as string)

// 定义导航菜单
const menuOptions = [
  {
    label: () => h(RouterLink, { to: '/' }, { default: () => 'Home' }),
    key: 'home',
  },
  {
    label: () => h(RouterLink, { to: '/dashboard' }, { default: () => 'Dashboard' }),
    key: 'dashboard',
  },
]
</script>

<style>
.layout {
  min-height: 100vh;
}

.header {
  padding: 0 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer {
  text-align: center;
  padding: 24px;
}

.logo-link {
  font-size: 24px;
  font-weight: bold;
  color: #000;
  text-decoration: none;
  transition: color 0.3s ease;
}

.logo-link:hover {
  color: #007bff;
}

#app {
  font-family: 'Roboto', Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 新增样式 */
:deep(.n-menu.n-menu--horizontal) {
  height: 64px;
}

:deep(.n-menu.n-menu--horizontal .n-menu-item-content) {
  height: 64px;
  line-height: 64px;
  padding: 0 20px;
}

:deep(.n-menu.n-menu--horizontal .n-menu-item-content__icon) {
  margin-right: 6px;
}

:deep(.n-menu.n-menu--horizontal .n-menu-item-content.n-menu-item-content--selected) {
  font-weight: bold;
}
</style>
