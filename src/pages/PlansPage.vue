<template>
  <q-page class="h-100 column page-content">
    <q-linear-progress :value="(selectStep-1)/1" class="q-mb-lg q-mt-md w-80 q-mx-auto" />
    <q-btn
      color="primary"
      label="Retour"
      v-if="selectStep > 1"
      class="q-mb-lg w-content"
      icon="arrow_back"
      @click="selectStep -= 1"
    />
    <ChoicePlan v-if="selectStep === 1" @selectPlan="selectPlan" />
    <PlanWorkouts v-if="selectStep === 2 && plan" :plan="plan" />
  </q-page>
</template>

<script>
import ChoicePlan from 'src/components/Plans/ChoicePlan.vue'
import PlanWorkouts from 'src/components/Plans/PlanWorkouts.vue'

export default {
  name: 'PlansPage',
  components: {
    ChoicePlan,
    PlanWorkouts
  },
  data () {
    return {
      selectStep: 1,
      plan: null
    }
  },
  methods: {
    selectPlan(plan) {
      this.plan = plan
      this.selectStep = 2
    },
  }
}
</script>
