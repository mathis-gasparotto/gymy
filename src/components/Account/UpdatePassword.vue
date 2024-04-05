<template>
  <div>
    <q-btn @click="() => {init(); show = true}" color="primary" class="w-content" >Modifier son mot de passe</q-btn>
    <q-dialog v-model="show">
      <q-card class="q-px-xs q-py-xs w-100">
        <q-card-section align="center">
          <div class="text-h6 text-center">Modifier votre mot de passe</div>
        </q-card-section>
        <q-card-section align="center" class="column">
          <q-form ref="updatePasswordForm" @submit.prevent="submit">
            <q-input
              name="password"
              outlined
              label="Ancien mot de passe"
              class="q-mb-md w-100"
              bg-color="white"
              :type="form.current.show ? 'text' : 'password'"
              v-model="form.current.value"
              lazy-rules
              autofocus
              :rules="[(val) => val.trim().length > 0 || 'Veullez remplir ce champ']"
              hide-bottom-space
            >
              <template v-slot:append>
                <q-icon
                  :name="form.current.show ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  color="primary"
                  @click="form.current.show = !form.current.show"
                />
              </template>
            </q-input>
            <q-input
              name="password"
              outlined
              label="Nouveau mot de passe"
              class="q-mb-md w-100"
              bg-color="white"
              :type="form.new.show ? 'text' : 'password'"
              v-model="form.new.value"
              lazy-rules
              hint="8 caractères minimum, une majuscule, une minuscule, un chiffre et un caractère spécial"
              hide-hint
              :rules="[
                (val) => val.trim().length > 0 || 'Veullez remplir ce champ',
                (val) =>
                  /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,}/g.test(val) ||
                  'Veullez renseigner un mot de passe contetant un caractère spécial, une majuscule, une minuscule et un chiffre, et d\'au moins 8 caractères'
              ]"
              hide-bottom-space
            >
              <template v-slot:append>
                <q-icon
                  :name="form.new.show ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  color="primary"
                  @click="form.new.show = !form.new.show"
                />
              </template>
            </q-input>
            <q-input
              name="confirmPassword"
              outlined
              label="Confirmation du nouveau mot de passe"
              class="q-mb-md w-100"
              bg-color="white"
              :type="form.confirmNew.show ? 'text' : 'password'"
              v-model="form.confirmNew.value"
              lazy-rules
              :rules="[
                (val) => val.trim().length > 0 || 'Veullez remplir ce champ',
                (val) => val === form.new.value || 'Veuillez confirmer votre nouveau mot de passe'
              ]"
              hide-bottom-space
            >
              <template v-slot:append>
                <q-icon
                  :name="form.confirmNew.show ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  color="primary"
                  @click="form.confirmNew.show = !form.confirmNew.show"
                />
              </template>
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
import { updatePassword } from 'src/services/authService'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import translatting from 'src/helpers/translatting'

export default {
  name: 'UpdatePassword',
  data() {
    return {
      show: false,
      loading: false,
      form: {
        current: {
          value: '',
          show: false
        },
        new: {
          value: '',
          show: false
        },
        confirmNew: {
          value: '',
          show: false
        }
      }
    }
  },
  computed: {
    isValid() {
      return this.form.current.value.trim().length > 0 && this.form.new.value.trim().length > 0 && this.form.confirmNew.value.trim().length > 0 && this.form.new.value === this.form.confirmNew.value
    }
  },
  methods: {
    init() {
      this.form = {
        current: {
          value: '',
          show: false
        },
        new: {
          value: '',
          show: false
        },
        confirmNew: {
          value: '',
          show: false
        }
      }
    },
    submit () {
      if (!this.isValid) return
      this.loading = true
      this.$refs.updatePasswordForm.validate().then((success) => {
        if (success) {
          updatePassword(this.form.current.value.trim(), this.form.new.value.trim()).then(() => {
            successNotify('Votre mot de passe a bien été mis à jour')
            this.init()
            this.show = false
            this.loading = false
          }).catch((err) => {
            errorNotify(translatting().translateUpdatePasswordError(err, 'Une erreur est survenue lors de la mise à jour de votre mot de passe'))
            this.loading = false
          })
        } else {
          this.loading = false
        }
      })
    }
  }
}
</script>

<styles scoped lang="scss">
</styles>
