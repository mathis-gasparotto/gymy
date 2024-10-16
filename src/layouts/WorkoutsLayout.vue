<template>
  <q-page class="flex h-100 column page-content">
    <div class="row gap-10 no-wrap justify-between items-center q-my-md">
      <q-btn
        color="primary"
        v-if="selectStep > 0"
        class="w-content"
        icon="arrow_back"
        :to="backUrl"
        no-wrap
        round
        flat
        padding="sm"
      />
      <q-linear-progress
        :value="selectStep / 2"
        class="q-mx-auto q-my-md"
      />
    </div>
    <router-view />
  </q-page>
</template>

<script>
export default {
  name: 'WorkoutsLayout',
  computed: {
    selectStep() {
      switch (this.$route.name) {
        case 'exercises':
          return 1
        case 'performances':
          return 2
        default:
          return 0
      }
    },
    backUrl() {
      switch (this.$route.name) {
        case 'exercises':
          return { name: 'workouts' }
        case 'performances':
          return { name: 'exercises', params: { workoutId: this.$route.params.workoutId } }
        default:
          return { name: 'index' }
      }
    }
  }
}
</script>
