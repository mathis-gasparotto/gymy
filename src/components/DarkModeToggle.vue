<template>
  <q-toggle
    toggle-indeterminate
    checked-icon="dark_mode"
    unchecked-icon="light_mode"
    indeterminate-icon="desktop_mac"
    color="white"
    icon-color="dark"
    @update:model-value="toggleDarkMode"
    :model-value="darkMode"
    indeterminate-value="auto"
  />
</template>

<script>
import { useQuasar } from 'quasar'
import { ref, watch } from 'vue'

export default {
  name: 'DarkModeToggle',
  setup () {
    const $q = useQuasar()

    const darkMode = ref(false)
    darkMode.value = $q.dark.mode
    watch(() => $q.dark.mode, val => {
      darkMode.value = val
    })

    return {
      darkMode
    }
  },
  methods: {
    toggleDarkMode(val) {
      this.$q.dark.set(val)
    }
  }
}
</script>

<style scoped>

</style>
