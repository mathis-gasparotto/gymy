<template>
  <q-form @submit.prevent="onsubmit()" class="flex-center column">
    <q-input
      name="label"
      rounded
      outlined
      label="Nom de l'entrainement"
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
      class="q-mb-md"
      type="text"
      v-model="workoutForm.comment"
      hide-bottom-space
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
        comment: ''
      }
    }
  },
  created() {
    if (this.initData) {
      this.workoutForm = {...this.initData}
    }
  },
  computed: {
    formValid() {
      return this.workoutForm.label.trim().length > 2
    }
  },
  methods: {
    onsubmit() {
      if (!this.formValid) return
      const payload = {
        ...this.workoutForm,
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
