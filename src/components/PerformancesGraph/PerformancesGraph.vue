<template>
  <Responsive>
    <template #main="{ width }">
      <div class="chart-container">
        <Chart :data="data" direction="horizontal" v-if="showChart"  :size="{ width, height: 420 }" :axis="axis" class="flex" :margin="margin">
          <template #layers>
            <Grid strokeDasharray="2,2" />
            <LineComp :dataKeys="['date', 'value']" type="step" />
            <LabelsLayer :dataKeys="['date', 'value']" />
          </template>
        </Chart>
      </div>
    </template>
  </Responsive>
</template>

<script>
import { Responsive, Chart, Grid, Line as LineComp } from 'vue3-charts'
import { getPerformanceAverage, getPerformances } from 'src/services/performanceService'
import formatting from 'src/helpers/formatting'
import LabelsLayer from './LabelsLayer.vue'

export default {
  name: 'PerformancesGraph',
  components: { Responsive, Chart, Grid, LineComp, LabelsLayer },
  props: {
    workoutId: {
      type: String,
      required: true
    },
    exerciceId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      performances: null,
      data: [],
      axis: {
        secondary: {
          domain: ['dataMin', 'dataMax + 5'],
          type: 'linear',
        }
      },
      margin: {
        top: 50,
        right: 20,
        bottom: 50,
        left: 20
      },
      showChart: false
    }
  },
  created() {
    this.loadPerformances()
  },
  methods: {
    async loadPerformances() {
      this.showChart = false
      this.performances = await getPerformances(this.workoutId, this.exerciceId)
      this.performances = this.performances.sort((a, b) => new Date(a.date) - new Date(b.date))
      this.data = []
      this.performances.forEach(async (perf) => {
        const value = await getPerformanceAverage(this.workoutId, this.exerciceId, perf.id)
        this.data.push({
          date: formatting().dateToDisplay(perf.date),
          value: value
        })
      })
      this.showChart = true
    }
  }
}
</script>

<style scoped lang="scss">
.chart-container {
  width: 100%;
  height: 420px;
}
</style>
