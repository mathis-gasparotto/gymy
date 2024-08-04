<template>
  <Responsive v-if="showChart" >
    <template #main="{ width }">
      <div class="chart-container">
        <Chart :data="data" direction="horizontal" :size="{ width, height: 420 }" :axis="axis" class="flex" :margin="margin">
          <template #layers>
            <Grid strokeDasharray="2,2" />
            <LineComp :dataKeys="['date', 'value']" type="step" />
            <LabelsLayer :dataKeys="['date', 'value']" :reversed="reversed" />
          </template>
          <template #widgets>
            <Tooltip
              :config="{
                value: { hide: true, label: 'poids/temps' },
                date: { label: 'date' },
                comment: { label: 'commentaire' },
              }"
              :canvas="{
                width: 100
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
    },
    reversed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      data: [],
      axis: {
        secondary: {
          domain: ['dataMin', 'dataMax + 2'],
          type: 'linear'
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
    if (this.reversed) {
      this.axis.secondary.domain = ['dataMin -2', '0']
      this.axis.secondary.format = (d) => d * -1
    }
  },
  methods: {
    loadPerformances() {
      this.showChart = false
      let performances = getPerformances(this.workoutId, this.exerciseId)
      performances = performances.sort((a, b) => new Date(a.date) - new Date(b.date))
      this.data = []
      performances.forEach((perf) => {
        const value = getPerformanceAverage(this.workoutId, this.exerciseId, perf.id)
        this.data.push({
          date: formatting().dateToDisplay(perf.date),
          value: value * (this.reversed ? -1 : 1),
          comment: perf.comment
        })
      })
      this.showChart = this.data.length > 0
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
