<template>
  <router-view />
</template>

<script>
import { LocalStorage, useQuasar } from 'quasar'
import { watch } from 'vue'

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

    watch(() => $q.dark.mode, val => {
      LocalStorage.set('darkMode', val)
    })

    return {
    }
  },
}
</script>
