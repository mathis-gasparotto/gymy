<template>
  <q-form @submit.prevent="onsubmit()" class="flex-center column">
    <q-input
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
      label="Durée de l'exercice"
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
      v-if="forAbsWorkout"
      v-model="exerciseForm.forLastSeries"
      label="Juste pour la dernière série"
      checked-icon="task_alt"
      unchecked-icon="highlight_off"
      class="q-mb-md"
    />
    <q-btn
      v-if="buttonIcon"
      color="primary"
      :label="buttonLabel"
      :icon="buttonIcon"
      type="submit"
      :disable="!formValid"
      :loading="loading"
    />
    <q-btn
      v-else
      color="primary"
      :label="buttonLabel"
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
      default: null
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
        forLastSeries: false
      }
    }
  },
  created() {
    if (this.initData) {
      this.exerciseForm = {duration: '', forLastSeries: false, ...this.exerciseForm, ...this.initData}
    }
  },
  computed: {
    formValid() {
      return this.exerciseForm.label.trim().length > 2 && (!this.forAbsWorkout || this.exerciseForm.duration)
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
