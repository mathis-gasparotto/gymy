<template>
  <PlanWorkouts :plan="plan" />
</template>

<script>
import PlanWorkouts from 'src/components/Plans/PlanWorkouts.vue'
import { errorNotify } from 'src/helpers/notifyHelper'
import { getPlan } from 'src/services/planService'

export default {
  name: 'PlanPage',
  components: {
    PlanWorkouts
  },
  data () {
    return {
      plan: null
    }
  },
  created() {
    this.loadPlan()
  },
  methods: {
    loadPlan() {
      this.plan = getPlan(this.$route.params.planId)
      if (!this.plan) {
        errorNotify('Impossible de charger la planification')
        this.$router.push({name: 'plans'})
      }
    },
  }
}
</script>
