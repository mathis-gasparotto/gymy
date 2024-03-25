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
          <template #widgets>
            <Tooltip
              :config="{
                value: { hide: true, label: 'poids/temps' },
                comment: { label: 'commentaire' },
                date: { hide: true, label: 'date' },
              }"
            />
          </template>
        </Chart>
      </div>
    </template>
  </Responsive>
</template>

<script>
import { Responsive, Chart, Grid, Line as LineComp, Tooltip } from 'vue3-charts'
import { getPerformanceAverage, getPerformances } from 'src/services/performanceService'
import formatting from 'src/helpers/formatting'
import LabelsLayer from './LabelsLayer.vue'

export default {
  name: 'PerformancesGraph',
  components: {
    Responsive,
    Chart,
    Grid,
    LineComp,
    LabelsLayer,
    Tooltip
  },
  props: {
    workoutId: {
      type: String,
      required: true
    },
    exerciseId: {
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
    loadPerformances() {
      this.showChart = false
      this.performances = getPerformances(this.workoutId, this.exerciseId)
      this.performances = this.performances.sort((a, b) => new Date(a.date) - new Date(b.date))
      this.data = []
      this.performances.forEach((perf) => {
        const value = getPerformanceAverage(this.workoutId, this.exerciseId, perf.id)
        this.data.push({
          date: formatting().dateToDisplay(perf.date),
          value: value,
          comment: perf.comment
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
