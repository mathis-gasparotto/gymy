<template>
  <div>
    <q-btn @click="show = true" color="primary" class="w-content">Modifier le temps de repos</q-btn>
    <q-dialog v-model="show">
      <q-card class="q-px-xs q-py-xs">
        <q-card-section align="center">
          <div class="text-h6 text-center">Modifier votre temps de repos</div>
        </q-card-section>
        <q-card-section align="center" class="column">
          <q-form ref="restTimeForm" @submit.prevent="submitRestTime">
            <q-input
              name="restTime"
              outlined
              class="q-mb-md"
              type="text"
              v-model="newRestTime"
              :rules="[
                (val) => /^-?[\d]?[\d]:[0-5]\d$/.test(val) || 'Veuillez renseigner une durée valide',
                (val) => (val !== null && val !== '') || 'Veuillez remplir ce champ',
              ]"
              hint="Format : 00:00"
              label="Temps de repos"
              lazy-rules
              hide-bottom-space
            >
            </q-input>
            <q-btn
              label="Enregistrer"
              type="submit"
              :disable="!isValid"
              :loading="loading"
              color="primary"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="Annuler" color="negative" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { updateUser } from 'src/services/userService'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import formatting from 'src/helpers/formatting'

export default {
  name: 'EditRestTime',
  emits: ['reloadUser'],
  props: {
    initData: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      newRestTime: null,
      show: false,
      loading: false,
      isValid: false,
    }
  },
  created() {
    this.newRestTime = this.initData
  },
  watch: {
    newRestTime() {
      if (this.$refs.restTimeForm && this.newRestTime) {
        this.$refs.restTimeForm.validate().then((res) => {
          this.isValid = res
        }).catch(() => {
          this.isValid = false
        })
      } else if (this.newRestTime) {
        this.isValid = true
      } else {
        this.isValid = false
      }
    }
  },
  methods: {
    submitRestTime() {
      if (!this.isValid) return
      this.loading = true
      updateUser({ restTime: formatting().durationFormatFromString(this.newRestTime) }).then(() => {
        this.$emit('reloadUser')
        this.loading = false
        this.show = false
        successNotify('Votre nombre de série par défaut a bien été modifié')
      }).catch((err) => {
        this.loading = false
        errorNotify('Une erreur est survenue lors de la modification de votre nombre de série par défaut')
      })
    }
  }
}
</script>

<styles scoped lang="scss">
</styles>
