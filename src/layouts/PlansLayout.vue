<template>
  <q-page class="h-100 column page-content">
    <q-linear-progress :value="selectStep/1" class="q-mb-lg q-mt-md w-80 q-mx-auto" />
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
  name: 'PlansLayout',
  computed: {
    selectStep() {
      switch (this.$route.name) {
        case 'plan':
          return 1
        default:
          return 0
      }
    }
  },
  methods: {
    goBack() {
      switch (this.$route.name) {
        case 'plan':
          return this.$router.push({name: 'plans'})
      }
    }
  }
}
</script>
