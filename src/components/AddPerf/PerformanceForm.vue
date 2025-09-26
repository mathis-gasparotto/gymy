<template>
  <q-card-section
    v-for="(item, index) in series"
    :key="item.id"
    class="flex justify-center items-center q-py-sm no-wrap"
    align="center"
  >
    <q-btn
      v-if="index > 0"
      color="secondary"
      icon="content_copy"
      class="q-px-none q-mr-sm"
      flat
      @click="copySeriesFromPrev(item.id)"
    />
    <div
      v-else-if="series.length > 1"
      class="btn-replace q-mr-sm"
    ></div>
    <q-input
      :name="'value-' + item.id"
      outlined
      class="exercise-input w-40"
      type="number"
      inputmode="decimal"
      v-model="item.value"
      min="0"
      :rules="[(val) => !val || val >= 0 || 'Veuillez renseigner une valeur positive']"
      label="Performance"
      lazy-rules
      hide-bottom-space
    >
    </q-input>
    <q-select
      outlined
      :name="'type-' + item.id"
      v-model="item.type"
      :options="types"
      emit-value
      map-options
      label="Type de performance"
      class="w-40"
      lazy-rules
      :rules="[(val) => PERFORMANCE_TYPES.includes(val) || 'Veuillez renseigner un type de performance']"
      hide-bottom-space
    >
    </q-select>
    <q-btn
      v-if="series.length > 1"
      color="negative"
      icon="remove"
      class="q-px-none q-ml-sm"
      flat
      @click="removeSeries(item.id)"
    />
  </q-card-section>
  <q-card-section
    class="q-pt-none q-mb-sm"
    align="center"
  >
    <q-btn
      color="primary"
      icon="add"
      label="Ajouter une série"
      @click="addSeries"
    />
  </q-card-section>
  <q-separator class="w-0" />
  <q-card-section
    class="q-pt-none q-mb-sm"
    align="center"
  >
    <q-input
      rounded
      outlined
      name="date"
      v-model="date"
      type="date"
      mask="date"
      class="q-mb-sm"
      lazy-rules
      label="Date de la performance"
      hide-bottom-space
    >
    </q-input>
    <q-input
      rounded
      outlined
      name="comment"
      v-model="comment"
      type="text"
      lazy-rules
      label="Commentaire (optionnel)"
      hide-bottom-space
    >
    </q-input>
  </q-card-section>
  <q-separator class="w-0" />
  <q-card-actions
    class="q-pt-none q-mb-sm"
    align="center"
  >
    <q-btn
      v-if="closeBtn"
      :label="closeBtnText"
      color="negative"
      v-close-popup
    />
    <q-btn
      color="primary"
      :label="submitText"
      @click="submit"
      :loading="loading"
      :disable="!inputsValid || loading"
    />
  </q-card-actions>
</template>

<script>
import { PERFORMANCE_TYPES, PERFORMANCE_TYPE_DEFAULT, PERFORMANCE_TYPE_BAR, PERFORMANCE_TYPE_ARM } from 'src/helpers/performanceHelper'
import { getUser } from 'src/services/userService'

export default {
  name: 'PerformanceForm',
  emits: ['submit'],
  props: {
    initData: {
      type: Object,
      required: false
    },
    exercise: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    submitText: {
      type: String,
      default: 'Ajouter'
    },
    closeBtn: {
      type: Boolean,
      default: false
    },
    closeBtnText: {
      type: String,
      default: 'Annuler'
    }
  },
  data() {
    return {
      series: [],
      types: [
        {
          value: PERFORMANCE_TYPE_DEFAULT,
          label: 'Défaut'
        },
        {
          value: PERFORMANCE_TYPE_BAR,
          label: 'Barre'
        },
        {
          value: PERFORMANCE_TYPE_ARM,
          label: 'Bras'
        }
      ],
      date: null,
      comment: null,
      defaultNumberOfSeries: null
    }
  },
  setup() {
    return { PERFORMANCE_TYPES }
  },
  created() {
    if (this.initData) {
      this.series = this.initData.series
      this.date = this.initData.date
      this.comment = this.initData.comment
    } else {
      this.defaultNumberOfSeries = this.exercise.defaultSeriesNumber || getUser().defaultNumberOfSeries
      this.initInputs()
    }
  },
  computed: {
    inputsValid() {
      const allDefault = this.series.filter((series) => series.value !== null && series.value !== '').every((series) => series.type === PERFORMANCE_TYPE_DEFAULT)
      const allNoDefault = this.series.filter((series) => series.value !== null && series.value !== '').every((series) => series.type !== PERFORMANCE_TYPE_DEFAULT)
      return this.series && this.series.filter((series) => series.value !== null && series.value !== '' && series.value >= 0).length >= 1 && ((allDefault && !allNoDefault) || (allNoDefault && !allDefault)) && this.date
    },
    defaultSeriesType() {
      return this.exercise.defaultSeriesType || PERFORMANCE_TYPE_DEFAULT
    }
  },
  methods: {
    initInputs() {
      this.series = []
      this.date = new Date().toISOString().substr(0, 10)
      this.comment = null
      for (let i = 0; i < this.defaultNumberOfSeries; i++) {
        this.series.push({
          id: new Date().getTime() + i,
          value: null,
          type: this.defaultSeriesType
        })
      }
    },
    addSeries() {
      this.series.push({
        id: new Date().getTime(),
        value: null,
        type: this.defaultSeriesType
      })
    },
    removeSeries(id) {
      if (this.series.length > 1) {
        this.series = this.series.filter((series) => series.id !== id)
      }
    },
    copySeriesFromPrev(id) {
      if (this.series.length <= 1) return
      const currentSeries = this.series.find((series) => series.id === id)
      if (!currentSeries) return
      const indexOfSeries = this.series.indexOf(currentSeries)
      if (indexOfSeries < 1) return
      const previousSeries = this.series[indexOfSeries - 1]
      if (!previousSeries) return
      currentSeries.value = previousSeries.value
      currentSeries.type = previousSeries.type
    },
    submit() {
      if (!this.inputsValid) return
      const payload = {
        date: this.date,
        series: this.series
          .filter((series) => series.value !== null && series.value !== '')
          .map((series) => ({
            value: series.value,
            type: series.type
          })),
        comment: this.comment
      }
      this.$emit('submit', payload)
    }
  }
}
</script>

<style scoped lang="scss">
.btn-replace {
  width: 24px;
}
</style>
