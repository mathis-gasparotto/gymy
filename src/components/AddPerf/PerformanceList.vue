<template>
  <div class="flex flex-center performance-list">
    <q-card v-for="performance in performances" :key="performance.id" @click="$emit('selectWorkout', performance)" class="cursor-pointer flex-center column q-px-md">
      <q-card-section>
        <div class="text-h6">
          {{ formatting().dateToDisplay(performance.date) }}
        </div>
      </q-card-section>
      <q-card-section>
        {{ performance.series.map(serie => serie.value + (serie.type === PERFORMANCE_TYPE_DEFAULT ? '' : ' (' + getPerfromanceType(serie.type) + ')')).join(' - ') }}
      </q-card-section>
      <q-card-actions horizontal class="no-wrap q-pa-none">
        <q-btn flat round color="primary" icon="edit" @click.stop="edit(performance)" />
        <q-btn flat round color="negative" icon="delete" @click.stop="showDeleteModal(performance)" />
      </q-card-actions>
    </q-card>

    <q-dialog v-model="editForm">
      <q-card class="q-pa-xl">
        <q-card-section align="center">
          <div class="text-h6 text-center">Modifier la performance du {{ performanceToEdit.date }}</div>
        </q-card-section>
        <q-card-section align="center" v-for="serie in performanceToEdit.series" :key="serie.id" class="flex flex-center q-py-sm">
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
        <q-card-section align="center" class="q-pt-none q-mb-sm">
          <q-btn
            color="primary"
            icon="add"
            label="Ajouter une série"
            @click="addSerie"
          />
        </q-card-section>
        <q-card-section align="center" class="q-pt-none q-mb-sm">
          <q-input
            rounded
            outlined
            v-model="performanceToEdit.date"
            type="date"
            mask="date"
            lazy-rules
            label="Date de la performance"
            hide-bottom-space
          >
          </q-input>
        </q-card-section>
        <q-card-section align="center" class="q-pt-none q-mb-sm">
          <q-btn
            color="primary"
            label="Modifier"
            @click="onEditSubmit"
            :loading="editLoading"
            :disable="!inputsValid"
          />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="Annuler" color="negative" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { PERFORMANCE_TYPE_DEFAULT, PERFORMANCE_TYPE_BAR, PERFORMANCE_TYPE_ARM } from 'src/helpers/performanceHelper'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import { deletePerformance, getPerformances, updatePerformance } from 'src/services/performanceService'
import formatting from 'src/helpers/formatting'
import { Dialog } from 'quasar'

export default {
  name: 'PerformanceList',
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
  setup () {
    return {
      PERFORMANCE_TYPE_DEFAULT,
      formatting
    }
  },
  data () {
    return {
      performances: [],
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
      editForm: false,
      editLoading: false,
      performanceToEdit: {}
    }
  },
  created () {
    this.loadPerformances()
  },
  computed: {
    inputsValid () {
      return this.performanceToEdit.series && this.performanceToEdit.series.filter(serie => serie.value !== null && serie.value !== '' && serie.value >= 0).length >= 1
    }
  },
  methods: {
    getPerfromanceType (typeData) {
      switch (typeData) {
        case PERFORMANCE_TYPE_BAR:
          return 'Barre'
        case PERFORMANCE_TYPE_ARM:
          return 'Bras'
        default:
          return 'Défaut'
      }
    },
    onEditSubmit() {
      this.editLoading = true
      updatePerformance(this.workout.id, this.exercice.id, this.performanceToEdit.id, {
        series: this.performanceToEdit.series.map(serie => ({
          ...serie,
          type: serie.type.value
        })),
        date: this.performanceToEdit.date
      })
        .then(async () => {
          await this.loadPerformances()
          successNotify('Votre performance a bien été modifiée')
          this.editForm = false
          this.editLoading = false
        })
        .catch((err) => {
          this.editLoading = false
          errorNotify('Une erreur est survenue lors de l\'édition de votre performance')
        })
    },
    addSerie () {
      this.performanceToEdit.series.push({
        id: new Date().getTime(),
        value: null,
        type: this.types[0]
      })
    },
    removeSerie (id) {
      if (this.performanceToEdit.series.length > 1) {
        this.performanceToEdit.series = this.performanceToEdit.series.filter((serie) => serie.id !== id)
      }
    },
    edit(performance) {
      this.performanceToEdit = {
        ...performance,
        series: performance.series.map(serie => ({ ...serie, type: this.types.find(type => type.value === serie.type)}))
      }
      this.editForm = true
    },
    async loadPerformances() {
      this.performances = await getPerformances(this.workout.id, this.exercice.id).catch(() => {
        errorNotify('Erreur lors de la récupération des performances')
      })
    },
    removePerformance(id) {
      deletePerformance(this.workout.id, this.exercice.id, id).then(async () => {
        await this.loadPerformances()
        successNotify('Performance supprimée')
      }).catch(() => {
        errorNotify('Erreur lors de la suppression de la performance')
      })
    },
    editPerformance(id, payload) {
      updatePerformance(this.workout.id, this.exercice.id, id, payload).then(async () => {
        await this.loadPerformances()
        successNotify('Performance modifiée')
      }).catch(() => {
        errorNotify('Erreur lors de la modification de la performance')
      })
    },
    showDeleteModal(performance) {
      let deleteLoading = false
      Dialog.create({
        title: 'Suppression de la performance',
        message: 'Êtes-vous sûr de vouloir supprimer votre performance du ' + formatting().dateToDisplay(performance.date) + ' ?',
        // persistent: true,
        ok: {
          label: 'Supprimer',
          color: 'negative',
          unelevated: true,
          loading: deleteLoading
        },
        cancel: {
          label: 'Annuler',
          color: 'primary',
          unelevated: true
        }
      })
        .onOk(() => {
          deleteLoading = true
          deletePerformance(this.workout.id, this.exercice.id, performance.id)
            .then(async () => {
              await this.loadPerformances()
              successNotify('Votre performance a bien été supprimée')
            })
            .catch((err) => {
              deleteLoading = false
              errorNotify('Une erreur est survenue lors de la suppression de votre performance')
            })
        })
        .onCancel(() => {
          // console.log('Cancel')
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
.performance-list {
  gap: 10px;
}
</style>
