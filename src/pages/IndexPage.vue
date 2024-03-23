<template>
  <q-page class="h-100">
    <div class="page-content flex items-center column">
      <h1 class="text-h4">Bonjour {{ user.username }}</h1>
      <img alt="Quasar logo" src="~assets/icon.png" style="width: 200px">
      <Timer class="q-mt-xl" />
    </div>
  </q-page>
</template>

<script>
import { getUser } from 'src/services/userService'
import Timer from 'src/components/Timer.vue'

export default {
  name: 'IndexPage',
  components: {
    Timer
  },
  setup() {
    return {
      user: getUser()
    }
  }
}
</script>
