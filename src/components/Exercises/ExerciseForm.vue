<template>
  <q-form
    @submit.prevent="onsubmit()"
    class="flex-center column"
  >
    <q-dialog
      v-model="showLinkModal"
      v-if="!forAbsWorkout && !exerciseForm.abs"
      persistent
    >
      <q-card class="q-pa-md min-h-xs-auto min-h-100 no-wrap column justify-between">
        <div>
          <div class="row gap-10 no-wrap justify-between items-center q-my-md">
            <q-btn
              color="primary"
              v-if="linkModalProgress > 0"
              class="w-content"
              icon="arrow_back"
              no-wrap
              round
              flat
              padding="sm"
              @click="backLinkProcess"
            />
            <q-linear-progress
              :value="linkModalProgress"
              class="q-mx-auto q-my-md"
            />
          </div>
          <q-card-section align="center">
            <div class="text-h6 text-center">Liaison de l'exercice {{ exerciseForm.label }}</div>
          </q-card-section>
          <q-card-section v-if="!exerciseForm.link.workout">
            <q-card-section v-if="workouts.length <= 0">Aucune séance non abs disponible</q-card-section>
            <q-card-section v-else>
              <q-item-label class="text-h6 text-center q-mb-lg"> Séances </q-item-label>
              <q-card
                v-for="workout in workouts"
                :key="workout.id"
                class="q-mb-md cursor-pointer"
                @click="exerciseForm.link.workout = workout.id"
              >
                <q-card-section>
                  <q-item-label class="text-center text-weight-bold">{{ workout.label }}</q-item-label>
                </q-card-section>
              </q-card>
            </q-card-section>
          </q-card-section>
          <q-card-section v-else>
            <q-card-section v-if="exercisesListForLink.length <= 0">Aucun exercise non abs disponible</q-card-section>
            <q-card-section v-else>
              <q-item-label class="text-h6 text-center q-mb-lg"> Exercices{{ workoutSelectedForLink ? ' - ' + workoutSelectedForLink.label : '' }}</q-item-label>
              <q-card
                v-for="exercise in exercisesListForLink"
                :key="exercise.id"
                class="q-mb-md cursor-pointer"
                @click="exerciseForm.link.exercise === exercise.id ? (exerciseForm.link.exercise = null) : (exerciseForm.link.exercise = exercise.id)"
                :class="{ 'bg-primary text-white': exerciseForm.link?.exercise === exercise.id }"
              >
                <q-card-section>
                  <q-item-label class="text-center text-weight-bold">{{ exercise.label }}</q-item-label>
                </q-card-section>
              </q-card>
            </q-card-section>
          </q-card-section>
        </div>
        <q-card-actions
          align="center"
          class="gap-20"
        >
          <q-btn
            v-if="exerciseForm.link?.workout"
            color="primary"
            label="Confirmer"
            v-close-popup
            :disable="!linkIsValid"
          />
          <q-btn
            label="Annuler"
            color="negative"
            v-close-popup
            @click="onLinkCancel"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div class="flex justify-between items-center q-mb-md w-100">
      <q-toggle
        :label="!exerciseForm.disabled ? 'Activé' : 'Désactivé'"
        color="primary"
        :false-value="true"
        :true-value="false"
        v-model="exerciseForm.disabled"
      />
      <q-checkbox
        v-if="!forAbsWorkout"
        v-model="exerciseForm.abs"
        label="Abs"
        left-label
        checked-icon="task_alt"
        unchecked-icon="highlight_off"
      />
      <q-checkbox
        v-else
        v-model="exerciseForm.restAbs"
        label="Repos"
        left-label
        checked-icon="task_alt"
        unchecked-icon="highlight_off"
      />
    </div>
    <q-input
      v-if="(!forAbsWorkout || !exerciseForm.restAbs) && !exerciseForm.abs"
      name="label"
      rounded
      outlined
      label="Nom de l'exercice"
      class="q-mb-md"
      type="text"
      v-model="exerciseForm.label"
      lazy-rules
      :rules="[(val) => val.trim().length > 2 || 'Veuillez renseigner minimum 3 caractères']"
      hide-bottom-space
    ></q-input>
    <q-input
      v-if="!exerciseForm.restAbs"
      name="config"
      rounded
      outlined
      :label="forAbsWorkout || exerciseForm.abs ? 'Commentaire' : 'Config de l\'exercice'"
      class="q-mb-md"
      type="text"
      v-model="exerciseForm.config"
      hide-bottom-space
    ></q-input>
    <template v-if="forAbsWorkout">
      <q-input
        name="duration"
        rounded
        outlined
        :label="!forAbsWorkout || !exerciseForm.restAbs ? 'Durée de l\'exercice' : 'Temps de repos'"
        class="q-mb-md"
        type="number"
        inputmode="numeric"
        :rules="[(val) => val !== '' || 'Veuillez renseigner une durée']"
        v-model="exerciseForm.duration"
        hide-bottom-space
        suffix="s"
      ></q-input>
      <q-checkbox
        v-model="exerciseForm.forLastSeries"
        label="Juste pour la dernière série"
        checked-icon="task_alt"
        unchecked-icon="highlight_off"
        class="q-mb-xs"
      />
      <q-checkbox
        v-model="exerciseForm.notForLastSeries"
        label="Exclure de la dernière série"
        checked-icon="task_alt"
        unchecked-icon="highlight_off"
        class="q-mb-md"
      />
    </template>
    <template v-if="!forAbsWorkout && !exerciseForm.abs">
      <q-select
        outlined
        name="defaultSeriesType"
        rounded
        v-model="exerciseForm.defaultSeriesType"
        emit-value
        map-options
        :options="seriesTypes"
        label="Type de performance par défaut"
        class="q-mb-md w-100"
        :rules="[(val) => PERFORMANCE_TYPES.includes(val) || 'Veuillez renseigner un type de performance']"
        hide-bottom-space
      ></q-select>
      <q-input
        outlined
        name="defaultSeriesNumber"
        rounded
        v-model="exerciseForm.defaultSeriesNumber"
        type="number"
        inputmode="numeric"
        label="Nombre de séries par défaut (nombre par défaut si pas renseigné)"
        class="q-mb-md w-100"
        min="1"
        :rules="[(val) => !val || val > 0 || 'Veuillez renseigner un nombre de séries positif']"
        hide-bottom-space
      ></q-input>
      <div class="q-mb-lg text-center">
        <div class="q-mb-sm">Valeur de progression :</div>
        <q-btn-toggle
          v-model="exerciseForm.isReverse"
          toggle-color="primary"
          name="isReverse"
          no-caps
          :options="[
            { label: 'Croissante', value: false },
            { label: 'Décroissante', value: true }
          ]"
        />
      </div>
      <div
        v-if="linked"
        class="q-mb-sm text-center"
      >
        Lié à : <b>{{ linkedWorkout.label }}</b> - <b>{{ linkedExercise.label }}</b>
      </div>
      <q-btn
        v-if="linked"
        class="q-mb-md"
        color="white"
        text-color="negative"
        label="Délier l'exercice"
        icon="link_off"
        no-caps
        @click="unlink"
      />
      <q-btn
        class="q-mb-xl"
        color="primary"
        :label="linked ? 'Modifier la liaison' : 'Lier à un autre exercice'"
        icon="link"
        no-caps
        @click="showLinkModal = true"
      />
    </template>
    <q-btn
      color="primary"
      :label="buttonLabel"
      :icon="buttonIcon"
      type="submit"
      :disable="!formValid"
      :loading="loading"
    />
  </q-form>
</template>

<script>
import { getNoAbsWorkouts, getWorkout } from 'src/services/workoutService'
import { getExercise, getExercises } from 'src/services/exerciseService'
import { PERFORMANCE_TYPES, PERFORMANCE_TYPE_ARM, PERFORMANCE_TYPE_BAR, PERFORMANCE_TYPE_DEFAULT } from 'src/helpers/performanceHelper'

export default {
  name: 'ExerciseForm',
  emits: ['submit'],
  props: {
    initData: {
      type: Object,
      required: false
    },
    buttonLabel: {
      type: String,
      required: false,
      default: 'Valider'
    },
    buttonIcon: {
      type: String,
      required: false,
      default: undefined
    },
    loading: {
      type: Boolean,
      required: false,
      default: false
    },
    forAbsWorkout: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup() {
    return { PERFORMANCE_TYPES }
  },
  data() {
    return {
      exerciseForm: {
        label: '',
        config: '',
        duration: '',
        forLastSeries: false,
        notForLastSeries: false,
        abs: false,
        restAbs: false,
        isReverse: false,
        disabled: false,
        defaultSeriesType: PERFORMANCE_TYPE_DEFAULT,
        link: {
          workout: null,
          exercise: null
        },
        defaultSeriesNumber: null
      },
      seriesTypes: [
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
      showLinkModal: false,
      workouts: []
    }
  },
  created() {
    if (this.initData) {
      this.exerciseForm = { ...this.exerciseForm, ...this.initData }
    }
    if (!this.linked) {
      this.exerciseForm.link = { workout: null, exercise: null }
    }
    this.loadWorkouts()
  },
  watch: {
    exerciseForm: {
      handler(val) {
        this.exerciseForm.duration = parseInt(val.duration)
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    formValid() {
      if (this.exerciseForm.abs) return true
      if (this.forAbsWorkout) {
        if (this.exerciseForm.restAbs) {
          return this.exerciseForm.duration !== ''
        }
        return this.exerciseForm.label.trim().length > 2 && this.exerciseForm.duration
      } else {
        return this.exerciseForm.label.trim().length > 2
      }
    },
    linkedWorkout() {
      return this.linked ? getWorkout(this.exerciseForm.link.workout) : null
    },
    linkedExercise() {
      return this.exerciseForm.link?.exercise && this.exerciseForm.link?.workout ? getExercise(this.exerciseForm.link.workout, this.exerciseForm.link.exercise) : null
    },
    linkModalProgress() {
      if (this.exerciseForm.link?.workout && this.exerciseForm.link?.exercise) {
        return 1
      } else if (this.exerciseForm.link?.workout) {
        return 0.5
      } else {
        return 0
      }
    },
    exercisesListForLink() {
      return this.exerciseForm.link?.workout ? getExercises(this.exerciseForm.link.workout).filter((exercise) => !exercise.abs && exercise.id !== this.exerciseForm.id) : []
    },
    workoutSelectedForLink() {
      return this.exerciseForm.link?.workout && this.workouts ? this.workouts.find((workout) => workout.id === this.exerciseForm.link.workout) : null
    },
    linkIsValid() {
      return this.exerciseForm.link?.workout && this.exerciseForm.link?.exercise
    },
    linked() {
      return !!this.linkedExercise
    }
  },
  methods: {
    onsubmit() {
      if (!this.formValid) return
      const payload = {
        ...this.exerciseForm,
        link: this.exerciseForm.link.workout && this.exerciseForm.link.exercise ? this.exerciseForm.link : null,
        duration: this.exerciseForm.duration ? parseInt(this.exerciseForm.duration) : null,
        label: this.exerciseForm.label.trim(),
        config: this.exerciseForm.config && this.exerciseForm.config.trim().length > 0 ? this.exerciseForm.config.trim() : null
      }
      this.$emit('submit', payload)
    },
    loadWorkouts() {
      this.workouts = getNoAbsWorkouts()
    },
    onLinkCancel() {
      if (this.initData?.link) {
        this.exerciseForm.link = getExercise(this.initData.link.workout, this.initData.link.exercise) ? this.initData.link : { workout: null, exercise: null }
      } else {
        this.exerciseForm.link = { workout: null, exercise: null }
      }
    },
    backLinkProcess() {
      this.exerciseForm.link = { workout: null, exercise: null }
    },
    unlink() {
      this.exerciseForm.link = { workout: null, exercise: null }
    }
  }
}
</script>

<style scoped lang="scss"></style>
