<template>
  <q-form @submit.prevent="onsubmit()" class="flex-center column">
    <q-checkbox
      v-if="!forAbsWorkout"
      v-model="exerciseForm.abs"
      label="Abs"
      checked-icon="task_alt"
      unchecked-icon="highlight_off"
      class="q-mb-md"
    />
    <template v-if="!exerciseForm.abs || forAbsWorkout">
      <q-checkbox
        v-if="forAbsWorkout"
        v-model="exerciseForm.restAbs"
        label="Repos"
        checked-icon="task_alt"
        unchecked-icon="highlight_off"
        class="q-mb-md"
      />
      <q-input
        v-if="!forAbsWorkout || !exerciseForm.restAbs"
        name="label"
        rounded
        outlined
        label="Nom de l'exercice"
        class="q-mb-md"
        type="text"
        v-model="exerciseForm.label"
        lazy-rules
        :rules="[
          (val) => val.trim().length > 2 || 'Veuillez renseigner minimum 3 caractères'
        ]"
        hide-bottom-space
      ></q-input>
      <q-input
        v-if="!forAbsWorkout || !exerciseForm.restAbs"
        name="config"
        rounded
        outlined
        :label="forAbsWorkout ? 'Commentaire' : 'Config de l\'exercice'"
        class="q-mb-md"
        type="text"
        v-model="exerciseForm.config"
        hide-bottom-space
      ></q-input>
      <q-input
        v-if="forAbsWorkout"
        name="duration"
        rounded
        outlined
        :label="!forAbsWorkout || !exerciseForm.restAbs ? 'Durée de l\'exercice' : 'Temps de repos'"
        class="q-mb-md"
        type="number"
        inputmode="numeric"
        :rules="[
          (val) => val !== '' || 'Veuillez renseigner une durée'
        ]"
        v-model="exerciseForm.duration"
        hide-bottom-space
        suffix="s"
      ></q-input>
      <q-checkbox
        v-if="forAbsWorkout && !exerciseForm.restAbs"
        v-model="exerciseForm.forLastSeries"
        label="Juste pour la dernière série"
        checked-icon="task_alt"
        unchecked-icon="highlight_off"
        class="q-mb-md"
      />
      <div class="q-mb-xl text-center" v-if="!forAbsWorkout">
        <div class="q-mb-sm">Valeur de progression :</div>
        <q-btn-toggle
          v-model="exerciseForm.isReverse"
          toggle-color="primary"
          name="isReverse"
          no-caps
          :options="[
            {label: 'Croissante', value: false},
            {label: 'Décroissante', value: true}
          ]"
        />
      </div>
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
  data() {
    return {
      addLoading: false,
      exerciseForm: {
        label: '',
        config: '',
        duration: '',
        forLastSeries: false,
        abs: false,
        restAbs: false,
        isReverse: false
      }
    }
  },
  created() {
    if (this.initData) {
      this.exerciseForm = {...this.exerciseForm, ...this.initData}
    }
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
    }
  },
  methods: {
    onsubmit() {
      if (!this.formValid) return
      const payload = {
        ...this.exerciseForm,
        duration: this.exerciseForm.duration ? parseInt(this.exerciseForm.duration) : null,
        label: this.exerciseForm.label.trim(),
        config: this.exerciseForm.config && this.exerciseForm.config.trim().length > 0 ? this.exerciseForm.config.trim() : null
      }
      this.$emit('submit', payload)
    }
  }
}
</script>

<style scoped lang="scss">
</style>
