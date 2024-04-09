<template>
  <q-page class="h-100">
    <div class="page-content flex items-center column">
      <h1 class="text-h4">Bonjour {{ user.username }}</h1>
      <!-- <img alt="Gymy logo" src="~assets/icon.png" style="width: 100px"> -->
      <Timer />
      <TodayWorkouts class="q-mt-xl" />
    </div>
  </q-page>
</template>

<script>
import { getUser } from 'src/services/userService'
import Timer from 'src/components/Timer.vue'
import TodayWorkouts from 'src/components/TodayWorkouts.vue'

export default {
  name: 'IndexPage',
  components: {
    Timer,
    TodayWorkouts
  },
  setup() {
    return {
      user: getUser()
    }
  }
}
</script>
