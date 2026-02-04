<template>
  <Responsive v-if="showChart">
    <template #main="{ width }">
      <div class="chart-container">
        <Chart
          :data="data"
          direction="horizontal"
          :size="{ width, height: 420 }"
          :axis="axis"
          class="flex"
          :margin="margin"
        >
          <template #layers>
            <Grid strokeDasharray="2,2" />
            <LineComp
              :dataKeys="['date', 'value']"
              type="step"
              :dotStyle="{ r: 0 }"
            />
            <!-- <LabelsLayer
              :dataKeys="['date', 'value', 'showValue']"
              :reversed="reversed"
            /> -->
          </template>
          <template #widgets>
            <Tooltip
              :config="{
                value: { label: 'charge/temps', format: (d) => (reversed ? d * -1 : d) },
                date: { hide: true },
                dateToShow: { label: 'date' },
                comment: { label: 'commentaire' },
                showValue: { hide: true }
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
// import LabelsLayer from './LabelsLayer.vue'

export default {
  name: 'PerformancesGraph',
  components: {
    Responsive,
    Chart,
    Grid,
    LineComp,
    // LabelsLayer,
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
        },
        primary: {
          type: 'linear',
          // domain: ['dataMin', 'dataMax'],
          format: (timestamp) => formatting().dateToDisplayCompact(new Date(timestamp))
        }
      },
      margin: {
        top: 50,
        right: 20,
        bottom: 50,
        left: 20
      },
      showChart: false,
      maxValueToShow: 7
    }
  },
  created() {
    if (screen.width >= 600 && screen.width < 1024) {
      this.maxValueToShow = 10
    } else if (screen.width >= 1024 && screen.width < 1440) {
      this.maxValueToShow = 20
    } else if (screen.width >= 1440 && screen.width < 1920) {
      this.maxValueToShow = 30
    } else if (screen.width >= 1920) {
      this.maxValueToShow = 60
    }
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
      const indexValueInterval = performances.length >= this.maxValueToShow ? Math.round(performances.length / (this.maxValueToShow - 1)) : 1

      performances.forEach((perf, i) => {
        const showValue = i === performances.length - 1 || (i % indexValueInterval === 0 && performances.length - i > indexValueInterval)
        const value = getPerformanceAverage(this.workoutId, this.exerciseId, perf.id)
        this.data.push({
          date: new Date(perf.date).getTime(),
          dateToShow: formatting().dateToDisplay(perf.date),
          value: value * (this.reversed ? -1 : 1),
          showValue,
          comment: formatting().maxStringLenght(perf.comment || '', 30)
        })
      })

      if (this.data.length > 0) {
        const timestamps = this.data.map(d => d.date)
        const minTime = Math.min(...timestamps)
        const maxTime = Math.max(...timestamps)

        const dayInMs = 86400000
        const timeMargin = dayInMs * 30
        this.axis.primary.domain = [minTime - timeMargin, maxTime + timeMargin]
      }

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

<style lang="scss">
body.body--dark line {
  stroke: white;
}
</style>
