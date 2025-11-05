<template>
  <router-view />
</template>

<script>
import { LocalStorage, useQuasar } from 'quasar'
import { watch } from 'vue'
import { StatusBar, Style } from '@capacitor/status-bar'

export default {
  name: 'App',
  setup () {
    const $q = useQuasar()

    const darkMode = LocalStorage.getItem('darkMode')
    if (darkMode !== null) {
      $q.dark.set(darkMode)
    } else {
      LocalStorage.set('darkMode', 'auto')
      $q.dark.set('auto')
    }

    if ($q.platform.is.capacitor) {
      if ($q.dark.isActive === true) {
        StatusBar.setStyle({ style: Style.Dark })
        StatusBar.setBackgroundColor({ color: '#0e0f0f' })
      } else {
        StatusBar.setStyle({ style: Style.Light })
        StatusBar.setBackgroundColor({ color: '#ffffff' })
      }
    }

    watch(() => $q.dark.mode, val => {
      LocalStorage.set('darkMode', val)

      if ($q.platform.is.capacitor) {
        if ($q.dark.isActive === true) {
          StatusBar.setStyle({ style: Style.Dark })
          StatusBar.setBackgroundColor({ color: '#0e0f0f' })
        } else {
          StatusBar.setStyle({ style: Style.Light })
          StatusBar.setBackgroundColor({ color: '#ffffff' })
        }
      }
    })

    return {
    }
  },
}
</script>
