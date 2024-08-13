<template>
  <div>
    <q-btn @click="show = true" color="primary" class="w-content">Modifier mon nombre de séries par défaut</q-btn>
    <q-dialog v-model="show">
      <q-card class="q-px-xs q-py-xs">
        <q-card-section align="center">
          <div class="text-h6 text-center">Modifier votre nombre de série par défaut</div>
        </q-card-section>
        <q-card-section align="center" class="column">
          <q-form ref="defaultNumberOfSeriesForm" @submit.prevent="submit">
            <q-input
              name="defaultNumberOfSeries"
              outlined
              class="q-mb-md"
              type="number"
              inputmode="numeric"
              v-model="newDefaultNumberOfSeries"
              min="1"
              :rules="[
                (val) => (val !== null && val !== '') || 'Veuillez remplir ce champ',
                (val) => val >= 1 || 'Veuillez renseigner une valeur positive supérieur à 0',
              ]"
              label="Nombre de séries par défaut"
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

export default {
  name: 'EditDefaultNumberOfSeries',
  emits: ['reloadUser'],
  props: {
    initData: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      newDefaultNumberOfSeries: null,
      show: false,
      loading: false
    }
  },
  created() {
    this.newDefaultNumberOfSeries = this.initData
  },
  watch: {
    newDefaultNumberOfSeries: {
      handler(val) {
        this.newDefaultNumberOfSeries = parseInt(val)
      },
      immediate: true
    }
  },
  computed: {
    isValid() {
      return this.newDefaultNumberOfSeries !== null && this.newDefaultNumberOfSeries !== '' && this.newDefaultNumberOfSeries >= 1
    }
  },
  methods: {
    submit() {
      if (!this.isValid) return
      this.loading = true
      updateUser({ defaultNumberOfSeries: Number(this.newDefaultNumberOfSeries) }).then(() => {
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
