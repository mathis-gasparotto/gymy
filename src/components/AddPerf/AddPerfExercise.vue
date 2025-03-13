<template>
  <div class="flex flex-center column">
    <q-card class="q-mb-md flex-center column q-px-none q-px-xs-md">
      <q-card-section>
        <div class="text-h6 text-center">{{ workout.label }} - {{ exercise.label }}</div>
        <div
          v-if="exercise.config"
          class="text-center"
        >
          ({{ exercise.config }})
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section
        v-for="(item, index) in series"
        :key="item.id"
        class="flex justify-center items-center q-py-sm no-wrap"
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
          v-else
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
          label="Type de performance"
          class="w-40"
          lazy-rules
          :rules="[(val) => typeof val === 'object' || 'Veuillez renseigner un type de performance']"
          hide-bottom-space
        >
        </q-select>
        <q-btn
          color="negative"
          icon="remove"
          class="q-px-none q-ml-sm"
          flat
          @click="removeSeries(item.id)"
        />
      </q-card-section>
      <q-card-section class="q-pt-none q-mb-sm">
        <q-btn
          color="primary"
          icon="add"
          label="Ajouter une série"
          @click="addSeries"
        />
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pt-none q-mb-sm">
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
      <q-separator />
      <q-card-section class="q-pt-none q-mb-sm">
        <q-btn
          color="primary"
          label="Ajouter"
          @click="submit"
          :disable="!inputsValid"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { PERFORMANCE_TYPE_DEFAULT, PERFORMANCE_TYPE_BAR, PERFORMANCE_TYPE_ARM } from 'src/helpers/performanceHelper'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import { addPerformanceWithRelated } from 'src/services/performanceService'
import { getUser } from 'src/services/userService'
import translatting from 'src/helpers/translatting'
import { getExercise, updateExercise } from 'src/services/exerciseService'

export default {
  name: 'AddPerfExercise',
  emits: ['reloadPerformances'],
  props: {
    workout: {
      type: Object,
      required: true
    },
    exercise: {
      type: Object,
      required: true
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
  created() {
    this.defaultNumberOfSeries = getUser().defaultNumberOfSeries
    this.initInputs()
  },
  updated() {
    this.initInputs()
  },
  computed: {
    inputsValid() {
      const allDefault = this.series.filter((series) => series.value !== null && series.value !== '').every((series) => series.type.value === PERFORMANCE_TYPE_DEFAULT)
      const allNoDefault = this.series.filter((series) => series.value !== null && series.value !== '').every((series) => series.type.value !== PERFORMANCE_TYPE_DEFAULT)
      return this.series && this.series.filter((series) => series.value !== null && series.value !== '' && series.value >= 0).length >= 1 && ((allDefault && !allNoDefault) || (allNoDefault && !allDefault)) && this.date
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
          type: this.types[0]
        })
      }
    },
    addSeries() {
      this.series.push({
        id: new Date().getTime(),
        value: null,
        type: this.types[0]
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
        series: this.series.map((series) => ({
          value: series.value,
          type: series.type.value
        })),
        comment: this.comment
      }
      addPerformanceWithRelated(this.workout.id, this.exercise.id, payload)
        .then(() => {
          this.$emit('reloadPerformances')
          successNotify('Performance ajoutée')
          this.initInputs()
        })
        .catch((err) => {
          errorNotify(translatting().translateError(err, "Erreur lors de l'ajout de la performance"))
        })
    }
  }
}
</script>

<style scoped lang="scss">
.btn-replace {
  width: 24px;
}
</style>
