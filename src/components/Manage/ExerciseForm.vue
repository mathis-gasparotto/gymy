<template>
  <q-form @submit.prevent="onsubmit()" class="flex-center column">
    <q-input
      name="label"
      rounded
      outlined
      label="Nom de l'exercise"
      autofocus
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
      label="Config de l'exercise"
      class="q-mb-md"
      type="text"
      v-model="exerciseForm.config"
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
    }
  },
  data() {
    return {
      addLoading: false,
      exerciseForm: {
        label: '',
        config: ''
      }
    }
  },
  created() {
    if (this.initData) {
      this.exerciseForm = {...this.initData}
    }
  },
  computed: {
    formValid() {
      return this.exerciseForm.label.trim().length > 2
    }
  },
  methods: {
    onsubmit() {
      if (!this.formValid) return
      this.$emit('submit', this.exerciseForm)
    }
  }
}
</script>

<style scoped lang="scss">
</style>
