<template>
  <q-form @submit.prevent="onsubmit()" class="flex-center column">
    <q-input
      name="label"
      rounded
      outlined
      label="Nom de l'entraînement"
      class="q-mb-md"
      type="text"
      v-model="workoutForm.label"
      lazy-rules
      :rules="[
        (val) => val.trim().length > 2 || 'Veuillez renseigner minimum 3 caractères'
      ]"
      hide-bottom-space
    ></q-input>
    <q-input
      name="comment"
      rounded
      outlined
      label="Commentaire"
      class="q-mb-sm"
      type="text"
      v-model="workoutForm.comment"
      hide-bottom-space
    ></q-input>
    <q-checkbox
      v-model="workoutForm.isAbs"
      label="Entraînement Abs"
      checked-icon="task_alt"
      unchecked-icon="highlight_off"
      class="q-mb-md"
    />
    <q-input
      v-if="workoutForm.isAbs"
      name="restTime"
      rounded
      outlined
      label="Temps de repos entre chaque série"
      class="q-mb-md"
      type="number"
      inputmode="numeric"
      :rules="[
        (val) => val !== '' || 'Veuillez renseigner un temps de repos'
      ]"
      v-model="workoutForm.restTime"
      hide-bottom-space
      suffix="s"
    ></q-input>
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
  name: 'WorkoutForm',
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
    }
  },
  data() {
    return {
      addLoading: false,
      workoutForm: {
        label: '',
        comment: '',
        isAbs: false,
        restTime: ''
      }
    }
  },
  created() {
    if (this.initData) {
      this.workoutForm = {...this.workoutForm, ...this.initData}
    }
  },
  watch: {
    workoutForm: {
      handler(val) {
        this.workoutForm.restTime = parseInt(val.restTime)
      },
      deep: true
    }
  },
  computed: {
    formValid() {
      return this.workoutForm.label.trim().length > 2 && (!this.workoutForm.isAbs || this.workoutForm.restTime)
    }
  },
  methods: {
    onsubmit() {
      if (!this.formValid) return
      const payload = {
        ...this.workoutForm,
        restTime: this.workoutForm.restTime ? parseInt(this.workoutForm.restTime) : null,
        label: this.workoutForm.label.trim(),
        comment: this.workoutForm.comment && this.workoutForm.comment.trim() !== '' ? this.workoutForm.comment.trim() : null
      }
      this.$emit('submit', payload)
    }
  }
}
</script>

<style scoped lang="scss">
</style>
