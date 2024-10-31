<template>
  <n-layout
    content-style="min-height: 100vh; max-width: 1200px; display: flex; flex-direction: column; margin: 0 auto;"
  >
    <n-layout-header bordered class="header">
      <div class="header-content">
        <router-link to="/" class="logo-link">
          <n-text @mouseover="hover = true" @mouseout="hover = false" class="logo-text">
            {{ logoText }}
          </n-text>
        </router-link>
        <div class="header-right">
          <n-button text @click="themesStore.toggleTheme()" class="theme-toggle">
            <template #icon>
              <n-icon size="22">
                <component :is="themeIcon" />
              </n-icon>
            </template>
          </n-button>
          <n-menu mode="horizontal" :options="menuOptions" :value="activeMenu" />
          <n-dropdown
            v-if="authStore.isAuthenticated"
            trigger="hover"
            :options="userMenuOptions"
            @select="handleUserMenuSelect"
          >
            <n-space vertical item-style="line-height: 0;">
              <n-avatar round size="large" :color="avatarColor" class="avatar-animated">
                {{ avatarText }}
              </n-avatar>
            </n-space>
          </n-dropdown>
          <n-button v-else text @click="goToAuth">登录</n-button>
        </div>
      </div>
    </n-layout-header>
    <n-layout-content
      content-style="padding: 24px 0; flex: 1; display: flex; flex-direction: column;"
      :native-scrollbar="false"
    >
      <router-view v-slot="{ Component }">
        <transition name="fade">
          <component :is="Component" />
        </transition>
      </router-view>
    </n-layout-content>
    <n-layout-footer bordered class="footer">
      <n-text>LessURL © {{ new Date().getFullYear() }}</n-text>
    </n-layout-footer>
  </n-layout>
</template>

<script setup lang="ts">
import { h, computed, type Component, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NMenu,
  NText,
  NButton,
  NIcon,
  NAvatar,
  NDropdown,
  NSpace,
  useDialog,
  useMessage,
} from 'naive-ui'
import { RouterLink } from 'vue-router'
import { SunnyOutline, MoonOutline } from '@vicons/ionicons5'
import { useThemesStore } from './stores/themes'
import { useAuthStore } from './stores/auth'
import { useLinksStore } from './stores/links'
import {
  Pencil as EditIcon,
  LogOutOutline as LogoutIcon,
  PersonCircleOutline as UserIcon,
} from '@vicons/ionicons5'

const themesStore = useThemesStore()
const authStore = useAuthStore()
const linksStore = useLinksStore()
const router = useRouter()
const dialog = useDialog()
const message = useMessage()
const hover = ref(false)

const logoText = computed(() => (hover.value ? 'LëssURL' : 'LessURL'))
const themeIcon = computed(() => (themesStore.isDarkTheme ? SunnyOutline : MoonOutline))

const route = useRoute()
const activeMenu = computed(() => route.name as string)

// 定义导航菜单
const menuOptions = [
  {
    label: () => h(RouterLink, { to: '/' }, { default: () => '首页' }),
    key: 'Home',
  },
  {
    label: () => h(RouterLink, { to: '/dashboard' }, { default: () => '控制台' }),
    key: 'Dashboard',
  },
]

const avatarText = computed(() => {
  const username = authStore.username
  return username ? username.charAt(0).toUpperCase() : '?'
})

const avatarColor = computed(() => {
  const colors = [
    '#a0a0a0', // 中性灰色
    '#808080', // 深灰色
    '#c0c0c0', // 浅灰色
    '#696969', // 暗灰色
  ]
  const index = authStore.username.length % colors.length
  return colors[index]
})

const userMenuOptions = [
  {
    label: '用户资料',
    key: 'profile',
    icon: renderIcon(UserIcon),
  },
  {
    label: '编辑用户资料',
    key: 'editProfile',
    icon: renderIcon(EditIcon),
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon(LogoutIcon),
  },
]

const handleUserMenuSelect = (key: string) => {
  if (key === 'logout') {
    showLogoutConfirmation()
  } else {
    message.info(`你点击了 ${key}`)
  }
}

const showLogoutConfirmation = () => {
  dialog.warning({
    title: '确认退出',
    content: '您确定要退出登录吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      handleLogout()
    },
    onNegativeClick: () => {
      // Do nothing, just close the dialog
    },
  })
}

const goToAuth = () => {
  router.push('/auth')
}

const handleLogout = () => {
  authStore.logout()
  linksStore.clearLinks()
  router.push('/')
  message.success('您已成功退出登录')
}

function renderIcon(icon: Component) {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon),
    })
  }
}
</script>

<style scoped>
.header {
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
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

:deep(.n-menu.n-menu--horizontal) {
  height: 64px;
  background-color: transparent;
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
  color: #fff;
}

.avatar-animated {
  transition: all 0.3s ease;
  cursor: pointer;
}

.avatar-animated:hover {
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(24, 160, 88, 0.5); /* 使用主题色的阴影 */
}

.avatar-animated:active {
  transform: scale(0.95);
}

/* 为下拉菜单添加过渡效果 */
:deep(.n-dropdown-menu) {
  transition: all 0.3s ease;
}
</style>
