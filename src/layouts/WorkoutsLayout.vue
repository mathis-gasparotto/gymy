<template>
  <q-page class="flex h-100 column page-content">
    <q-linear-progress :value="selectStep/2" class="q-mb-lg q-mt-md w-80 q-mx-auto" />
    <q-btn
      color="primary"
      label="Retour"
      v-if="selectStep > 0"
      class="q-mb-lg w-content"
      icon="arrow_back"
      @click="goBack"
    />
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
    }
  },
  methods: {
    goBack() {
      switch (this.$route.name) {
        case 'exercises':
          return this.$router.push({name: 'workouts'})
        case 'performances':
          return this.$router.push({name: 'exercises', params: {workoutId: this.$route.params.workoutId}})
        default:
          return 0
      }
    }
  }
}
</script>
