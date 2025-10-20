<template>
  <q-form @submit.prevent="onsubmit()" class="flex-center column">
    <q-input
      name="label"
      autofocus
      rounded
      outlined
      label="Nom de la planification"
      class="q-mb-md"
      type="text"
      v-model="planForm.label"
      lazy-rules
      :rules="[
        (val) => val.trim().length > 2 || 'Veuillez renseigner minimum 3 caractères'
      ]"
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
  name: 'PlanForm',
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
      planForm: {
        label: ''
      }
    }
  },
  created() {
    if (this.initData) {
      this.planForm = {...this.planForm, ...this.initData}
    }
  },
  computed: {
    formValid() {
      return this.planForm.label.trim().length > 2
    }
  },
  methods: {
    onsubmit() {
      if (!this.formValid) return
      this.$emit('submit', this.planForm)
    }
  }
}
</script>

<style scoped lang="scss">
</style>
