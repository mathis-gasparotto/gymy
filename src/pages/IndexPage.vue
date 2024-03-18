<template>
  <q-page class="flex flex-center">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
      >
      <q-btn @click="logout">Logout</q-btn>
  </q-page>
</template>

<script>
import { logout } from 'src/services/authService'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndexPage',
  setup() {
    return {
      logout
    }
  }
})
</script>
