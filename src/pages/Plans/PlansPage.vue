<template>
  <ChoicePlan @selectPlan="selectPlan" />
</template>

<script>
import ChoicePlan from 'src/components/Plans/ChoicePlan.vue'

export default {
  name: 'PlansPage',
  components: {
    ChoicePlan
  },
  methods: {
    selectPlan(plan) {
      this.$router.push({
        name: 'plan',
        params: {
          planId: plan.id
        }
      })
    }
  }
}
</script>
