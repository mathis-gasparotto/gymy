<template>
  <div>
    <q-btn @click="show = true" color="primary" class="w-content">Modifier mon nom d'utilisateur</q-btn>
    <q-dialog v-model="show">
      <q-card class="q-px-xs q-py-xs">
        <q-card-section align="center">
          <div class="text-h6 text-center">Modifier votre nom d'utilisateur</div>
        </q-card-section>
        <q-card-section align="center" class="column">
          <q-form ref="updateUsernameForm" @submit.prevent="submit">
            <q-input
              name="username"
              outlined
              class="q-mb-md"
              type="text"
              v-model="newUsername"
              :rules="[
                (val) => val.trim().length > 3 || 'Veuillez renseigner minimum 4 caractères',
              ]"
              label="Nouveau nom d'utilisateur"
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
import { updateUsername } from 'src/services/userService'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import translatting from 'src/helpers/translatting'

export default {
  name: 'EditUsername',
  emits: ['reloadUser'],
  data() {
    return {
      newUsername: null,
      show: false,
      loading: false
    }
  },
  computed: {
    isValid() {
      return this.newUsername && this.newUsername.trim().length > 3
    }
  },
  methods: {
    submit() {
      if (!this.isValid) return
      this.loading = true
      updateUsername(this.newUsername).then(() => {
        this.$emit('reloadUser')
        this.loading = false
        this.show = false
        successNotify('Votre nom d\'utilisateur a bien été modifié')
      }).catch((err) => {
        this.loading = false
        errorNotify(translatting().translateUpdateUsername(err, 'Une erreur est survenue lors de la modification de votre nom d\'utilisateur'))
      })
    }
  }
}
</script>

<styles scoped lang="scss">
</styles>
