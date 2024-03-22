<template>
  <div class="flex flex-center column">
    <q-card class="q-mb-md flex-center column q-px-md">
      <q-card-section>
        <div class="text-h6 text-center">
          {{ workout.label }} - {{ exercice.label }}
        </div>
        <div v-if="exercice.config" class="text-center">
          ({{ exercice.config }})
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section v-for="serie in series" :key="serie.id" class="flex justify-center q-py-sm no-wrap">
        <q-input
          :name="'value-' + serie.id"
          outlined
          class="exercice-input w-40"
          type="number"
          inputmode="numeric"
          v-model="serie.value"
          min="0"
          :rules="[
            (val) => (val !== null && val !== '') || 'Veullez remplir ce champ',
            (val) => val >= 0 || 'Veullez renseigner une valeur positif',
          ]"
          label="Performance"
          lazy-rules
          hide-bottom-space
        >
        </q-input>
        <q-select
          outlined
          :name="'type-' + serie.id"
          v-model="serie.type"
          :options="types"
          label="Type de performance"
          class="w-40"
          lazy-rules
          :rules="[(val) => typeof val === 'object' || 'Veullez renseigner un type de performance']"
          hide-bottom-space
        >
        </q-select>
        <q-btn
          color="negative"
          icon="delete"
          class="btn-delete q-ml-md"
          round
          @click="removeSerie(serie.id)"
        />
      </q-card-section>
      <q-card-section class="q-pt-none q-mb-sm">
        <q-btn
          color="primary"
          icon="add"
          label="Ajouter une série"
          @click="addSerie"
        />
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pt-none q-mb-sm">
        <q-input
          rounded
          outlined
          v-model="date"
          type="date"
          mask="date"
          lazy-rules
          label="Date de la performance"
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
import { addPerformance } from 'src/services/performanceService'
import { getUser } from 'src/services/userService'

export default {
  name: 'AddPerfExercice',
  emits: ['reloadPerformances'],
  props: {
    workout: {
      type: Object,
      required: true
    },
    exercice: {
      type: Object,
      required: true
    },
  },
  data () {
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
        },
      ],
      date: null,
      defaultNumberOfSeries: null
    }
  },
  async created () {
    this.defaultNumberOfSeries = await getUser().defaultNumberOfSeries
    this.initInputs()
  },
  computed: {
    inputsValid () {
      const allDefault = this.series.every(serie => serie.type.value === PERFORMANCE_TYPE_DEFAULT)
      const allNoDefault = this.series.every(serie => serie.type.value !== PERFORMANCE_TYPE_DEFAULT)
      return this.series && this.series.filter(serie => serie.value !== null && serie.value !== '' && serie.value >= 0).length >= 1 && ((allDefault && !allNoDefault) || (allNoDefault && !allDefault)) && this.date
    }
  },
  methods: {
    initInputs() {
      this.series = []
      this.date = new Date().toISOString().substr(0, 10)
      for (let i = 0; i < this.defaultNumberOfSeries; i++) {
        this.series.push({
          id: new Date().getTime() + i,
          value: null,
          type: this.types[0]
        })
      }
    },
    addSerie () {
      this.series.push({
        id: new Date().getTime(),
        value: null,
        type: this.types[0]
      })
    },
    removeSerie (id) {
      if (this.series.length > 1) {
        this.series = this.series.filter((serie) => serie.id !== id)
      }
    },
    submit () {
      if (!this.inputsValid) return
      const payload = {
        date: this.date,
        series: this.series.map(serie => {
          if (serie.value !== null && serie.value !== '' && serie.value >= 0) {
            return {
              value: serie.value,
              type: serie.type.value
            }
          }
        })
      }
      addPerformance(this.workout.id, this.exercice.id, payload).then(() => {
        this.$emit('reloadPerformances')
        successNotify('Performance ajoutée')
        this.initInputs()
      }).catch(() => {
        errorNotify('Erreur lors de l\'ajout de la performance')
      })
    }
  }
}
</script>

<style scoped lang="scss">
.btn-delete {
  height: 3em;
  width: 3em;
}
</style>
