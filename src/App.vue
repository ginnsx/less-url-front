<template>
  <n-loading-bar-provider>
    <n-message-provider>
      <n-notification-provider>
        <n-config-provider :theme="theme" :locale="zhCN" :date-locale="dateZhCN">
          <div class="app-container">
            <n-layout content-class="layout" :native-scrollbar="false">
              <n-layout-header bordered class="header">
                <div class="header-content">
                  <router-link to="/" class="logo-link">
                    <n-text class="logo-text">LessURL</n-text>
                  </router-link>
                  <div class="header-right">
                    <n-menu mode="horizontal" :options="menuOptions" :value="activeMenu" />
                    <n-button
                      text
                      style="font-size: 24px"
                      @click="toggleTheme"
                      class="theme-toggle"
                    >
                      <template #icon>
                        <n-icon size="22">
                          <sunny-outline v-if="isDarkTheme" />
                          <moon-outline v-else />
                        </n-icon>
                      </template>
                    </n-button>
                  </div>
                </div>
              </n-layout-header>
              <n-layout-content
                class="content"
                content-style="padding: 24px; flex-grow: 1;"
                :native-scrollbar="false"
              >
                <router-view v-slot="{ Component }">
                  <transition name="fade" mode="out-in">
                    <component :is="Component" />
                  </transition>
                </router-view>
              </n-layout-content>
              <n-layout-footer bordered class="footer">
                <n-text>LessURL © {{ new Date().getFullYear() }}</n-text>
              </n-layout-footer>
            </n-layout>
          </div>
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
const activeMenu = computed(() => route.name as string)

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
.app-container {
  min-height: 100vh;
}

.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
}

.header {
  padding: 0 24px;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.1);
  height: var(--header-height);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer {
  text-align: center;
  padding: 24px;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.1);
  height: 64px;
}

.logo-link {
  text-decoration: none;
  transition: transform 0.3s ease;
}

.logo-link:hover {
  transform: scale(1.05);
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(45deg, #00b09b 0%, #96c93d 99%, #96c93d 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.theme-toggle {
  transition: transform 0.3s ease;
}

.theme-toggle:hover {
  transform: rotate(30deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.n-menu.n-menu--horizontal {
  height: 64px;
  background-color: transparent;
}

.n-menu.n-menu--horizontal .n-menu-item-content {
  height: 64px;
  line-height: 64px;
  padding: 0 20px;
}

.n-menu.n-menu--horizontal .n-menu-item-content__icon {
  margin-right: 6px;
}

.n-menu.n-menu--horizontal .n-menu-item-content.n-menu-item-content--selected {
  font-weight: bold;
  color: #fff;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
