import { defineStore } from 'pinia'
import { useOsTheme, darkTheme, lightTheme } from 'naive-ui'

const osThemeRef = useOsTheme()
const themeName = osThemeRef.value === 'dark' ? 'dark' : 'light'

export const useThemesStore = defineStore('themes', {
  state: () => ({
    themeName: themeName as string,
  }),
  getters: {
    theme: (state) => (state.themeName === 'dark' ? darkTheme : lightTheme),
    isDarkTheme: (state) => state.themeName === 'dark',
  },
  actions: {
    toggleTheme() {
      this.themeName = this.themeName === 'dark' ? 'light' : 'dark'
    },
  },
})
