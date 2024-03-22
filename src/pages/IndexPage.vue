<template>
  <q-page class="h-100">
    <div class="page-content flex items-center column">
      <h1 class="text-h4">Bonjour {{ user.username }}</h1>
      <img alt="Quasar logo" src="~assets/icon.png" style="width: 200px">
    </div>
  </q-page>
</template>

<script>
import { getUser } from 'src/services/userService'

export default {
  name: 'IndexPage',
  setup() {
    return {
      user: getUser()
    }
  }
}
</script>
