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
import { logout as logoutFirebase } from 'src/services/authService'

export default {
  name: 'IndexPage',
  methods: {
    logout() {
      logoutFirebase().then(() => {
        this.$router.push({ name: 'login' })
      })
    }
  }
}
</script>
