<template>
  <div>
    <q-btn @click="() => {init(); show = true}" color="primary" class="w-content">S'inscrire</q-btn>
    <q-dialog v-model="show">
      <q-card class="q-pa-md w-100">
        <q-card-section align="center">
          <div class="text-h6 text-center">S'inscrire</div>
        </q-card-section>
        <q-card-section align="center" class="column">
          <q-form ref="signupAsGuestForm" @submit.prevent="submit">
            <q-input
              name="username"
              rounded
              outlined
              label="Nom d'utilisateur*"
              class="q-mb-md"
              type="text"
              v-model="form.username"
              lazy-rules
              :rules="[
                (val) => val.trim().length > 3 || 'Veuillez renseigner minimum 4 caractères'
              ]"
              hide-bottom-space
            ></q-input>
            <q-input
              name="email"
              rounded
              outlined
              label="Addresse email*"
              class="q-mb-md"
              type="email"
              inputmode="email"
              v-model="form.email"
              lazy-rules
              :rules="[
                (val, rules) =>
                  rules.email(val) || 'Veuillez renseigner une adresse email valide'
              ]"
              hide-bottom-space
            ></q-input>
            <q-input
              name="password"
              rounded
              outlined
              label="Mot de passe*"
              class="q-mb-md"
              :type="form.password.show ? 'text' : 'password'"
              v-model="form.password.value"
              lazy-rules
              hint="8 caractères minimum, une majuscule, une minuscule, un chiffre et un caractère spécial"
              hide-hint
              :rules="[
                (val) => val.trim().length > 0 || 'Veuillez remplir ce champ',
                (val) =>
                  /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,}/g.test(val) ||
                  'Veuillez renseigner un mot de passe contetant un caractère spécial, une majuscule, une minuscule et un chiffre, et d\'au moins 8 caractères'
              ]"
              hide-bottom-space
            >
              <template v-slot:append>
                <q-icon
                  :name="form.password.show ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  color="primary"
                  @click="form.password.show = !form.password.show"
                />
              </template>
            </q-input>
            <q-input
              name="confirmPassword"
              rounded
              outlined
              label="Confirmation du mot de passe*"
              class="q-mb-md"
              :type="form.confirmPassword.show ? 'text' : 'password'"
              v-model="form.confirmPassword.value"
              lazy-rules
              :rules="[
                (val) => val.trim().length > 0 || 'Veuillez remplir ce champ',
                (val) =>
                  val === form.password.value || 'Veuillez confirmer votre mot de passe'
              ]"
              hide-bottom-space
            >
              <template v-slot:append>
                <q-icon
                  :name="form.confirmPassword.show ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  color="primary"
                  @click="form.confirmPassword.show = !form.confirmPassword.show"
                />
              </template>
            </q-input>
            <q-input
              name="defaultNumberOfSeries"
              rounded
              outlined
              class="q-mb-md"
              type="number"
              inputmode="numeric"
              v-model="form.defaultNumberOfSeries"
              min="1"
              :rules="[
                (val) => (val !== null && val !== '') || 'Veuillez remplir ce champ',
                (val) => val >= 1 || 'Veuillez renseigner une valeur positive supérieur à 0',
              ]"
              label="Nombre de séries par défaut*"
              lazy-rules
              hide-bottom-space
            >
            </q-input>
            <q-input
              name="restTime"
              rounded
              outlined
              class="q-mb-md"
              type="text"
              v-model="form.restTime"
              :rules="[
                (val) => /^-?[\d]?[\d]:[0-5]\d$/.test(val) || 'Veuillez renseigner une durée valide',
                (val) => (val !== null && val !== '') || 'Veuillez remplir ce champ',
              ]"
              hint="Format : 00:00"
              label="Temps de repos*"
              lazy-rules
              hide-bottom-space
            >
            </q-input>

            <p class="flex-end text-right signup-text">*Champ obligatoire</p>

            <q-btn
              label="S'inscrire"
              type="submit"
              :class="`form-btn btn btn-${isValid ? 'primary' : 'disabled'}`"
              :disable="!isValid"
              rounded
              :loading="loading"
              padding="sm 50px"
              size="20px"
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
import { logout, signup } from 'src/services/authService'
import { getUser } from 'src/services/userService'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import translatting from 'src/helpers/translatting'
import { formatUserLocalStorageDatabase } from 'src/helpers/databaseHelper'

export default {
  name: 'SignupAsGuest',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      show: false,
      loading: false,
      form: {
        username: '',
        email: '',
        password: {
          value: '',
          show: false
        },
        confirmPassword: {
          value: '',
          show: false
        },
        defaultNumberOfSeries: null,
        restTime: null
      },
      isValid: true
    }
  },
  methods: {
    submit() {
      this.$refs.signupAsGuestForm.validate().then((res) => {
        this.isValid = res
        if (res) {
          this.loading = true
          const currentUserData = formatUserLocalStorageDatabase(getUser())
          signup(this.form.email.trim(), this.form.password.value.trim(), this.form.username.trim(), this.form.defaultNumberOfSeries, this.form.restTime, currentUserData).then(() => {
            logout().then(() => {
              this.$router.push({ name: 'login' })
            })
            successNotify('Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception pour activer votre compte.')
          }).catch((err) => {
            errorNotify(translatting().translateSignupError(err, 'Une erreur est survenue lors de votre inscription'))
            this.loading = false
          })
        }
      })
    },
    init() {
      this.form = {
        username: '',
        email: '',
        password: {
          value: '',
          show: false
        },
        confirmPassword: {
          value: '',
          show: false
        },
        defaultNumberOfSeries: this.user.defaultNumberOfSeries,
        restTime: this.user.restTime
      }
    }
  }
}
</script>

<styles scoped lang="scss">
</styles>
