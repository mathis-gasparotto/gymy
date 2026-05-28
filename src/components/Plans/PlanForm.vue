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
    <q-input
      name="weekStartAt"
      rounded
      outlined
      label="Semaine de la planification"
      class="q-mb-md"
      :type="isChromeDesktopOrIos ? 'week' : 'date'"
      v-model="planForm.weekStartAt"
      mask="####-W##"
      clearable
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
import { Capacitor } from '@capacitor/core';
import formatting from '../../helpers/formatting'
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
      if (this.planForm.weekStartAt && !this.isChromeDesktopOrIos) {
        this.planForm.weekStartAt = formatting().firstDayOfWeek(this.planForm.weekStartAt)
      }
    }
  },
  computed: {
    formValid() {
      return this.planForm.label.trim().length > 2
    },
    isChromeDesktopOrIos() {
      const platform = Capacitor.getPlatform()
      if (platform === 'ios') return true
      if (platform === 'android') return false

      const ua = navigator.userAgent.toLowerCase()
      const isAndroid = ua.includes('android')
      const isIos = /iphone|ipad|ipod/.test(ua)
      const isChromeDesktop = ua.includes('chrome') && !ua.includes('edg') && !isAndroid
      return isIos || isChromeDesktop
    }
  },
  methods: {
    onsubmit() {
      if (!this.formValid) return
      const payload = {
        ...this.planForm
      }
      if (payload.weekStartAt && !this.isChromeDesktopOrIos) {
        payload.weekStartAt = formatting().weekString(payload.weekStartAt)
      }
      this.$emit('submit', payload)
    }
  }
}
</script>

<style scoped lang="scss">
</style>
