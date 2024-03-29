<template>
  <div class="login-page page">
    <q-img
      src="~assets/icon.png"
      style="width: 200px"
      class="q-mb-xl"
    ></q-img>
    <q-form
      class="flex flex-center column form login-form"
      ref="loginForm"
      @submit.prevent="onsubmit()"
    >
      <q-input
        name="email"
        rounded
        outlined
        label="Adresse mail"
        class="q-mb-md login-input"
        type="email"
        inputmode="email"
        v-model="form.email"
        :rules="[
          (val, rules) =>
            rules.email(val) || 'Veuillez renseigner une adresse email valide'
        ]"
        lazy-rules
        hide-bottom-space
      ></q-input>
      <q-input
        name="password"
        rounded
        outlined
        label="Mot de passe"
        class="q-mb-md login-input"
        :type="showPassword ? 'text' : 'password'"
        v-model="form.password"
        :rules="[(val) => val.trim().length > 0 || 'Veuillez remplir ce champ']"
        lazy-rules
        hide-bottom-space
      >
        <template v-slot:append>
          <q-icon
            :name="showPassword ? 'visibility' : 'visibility_off'"
            class="cursor-pointer"
            color="primary"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>
      <q-btn
        label="Se connecter"
        type="submit"
        rounded
        :loading="loading"
        padding="sm 50px"
        size="18px"
        :disable="!validate"
        :class="`form-btn btn btn-${validate ? 'primary' : 'disabled'}`"
      />
    </q-form>
    <q-card flat>
      <q-card-section>
        <p class="q-my-xs text-center">
          <!-- <router-link to="#">Mot de passe oublié ?</router-link> -->
        </p>
      </q-card-section>
      <q-separator spaced size="2px" color="white" rounded />
      <q-card-section class="text-center text-bold link">
        <span @click="showForgotPassword">
          Mot de passe oublié ?
        </span>
      </q-card-section>
      <q-card-section>
        <p class="q-my-xs text-center">
          Tu n'as pas de compte ?
          <router-link :to="{ name: 'signup' }" class="text-bold"
            >Inscris toi</router-link
          >
        </p>
        <p class="q-my-lg text-center text-bold link" @click="continueAsGuest">
          Continuer en tant qu'invité
        </p>
      </q-card-section>
    </q-card>
    <q-dialog v-model="forgotPassword">
      <q-card class="q-px-xs q-py-xs">
        <q-card-section align="center">
          <div class="text-h6 text-center">Réinitialisez votre mot de passe</div>
        </q-card-section>
        <q-card-section align="center" class="column">
          <q-form ref="sendResetPasswordForm" @submit.prevent="sendResetPassword">
            <q-input
              name="email"
              outlined
              class="q-mb-md"
              type="email"
              inputmode="email"
              v-model="emailForForgotPassword"
              min="1"
              :rules="[
                (val, rules) =>
                  rules.email(val) || 'Veuillez renseigner une adresse email valide'
              ]"
              label="Adresse mail"
              lazy-rules
              hide-bottom-space
            >
            </q-input>
            <p v-if="resetPasswordNotif" :class="'text-' + resetPasswordNotif.variant" v-html="resetPasswordNotif.message"></p>
            <q-btn
              label="Envoyer"
              icon="send"
              type="submit"
              :loading="sendResetPasswordLoading"
              color="primary"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="Fermer" color="negative" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { login, loginAsGuest, sendResetPassword as sendResetPasswordFirebase } from 'src/services/authService'
import translate from 'src/helpers/translatting'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import { Dialog } from 'quasar'

export default {
  name: 'LoginPage',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      showPassword: false,
      forgotPassword: false,
      sendResetPasswordLoading: false,
      emailForForgotPassword: '',
      resetPasswordNotif: null,
      loading: false,
      validate: false
    }
  },
  watch: {
    form: {
      handler() {
        if (this.form.email && this.form.password) {
          this.$refs.loginForm.validate().then((success) => {
            if (success) {
              this.validate = true
            } else {
              this.validate = false
            }
          })
          this.validate = true
        } else {
          this.validate = false
        }
      },
      deep: true
    }
  },
  methods: {
    showForgotPassword() {
      this.forgotPassword = true
      this.emailForForgotPassword = this.form.email
    },
    sendResetPassword() {
      this.sendResetPasswordLoading = true
      sendResetPasswordFirebase(this.emailForForgotPassword).then(() => {
        this.resetPasswordNotif = { variant: 'positive', message: 'Un email de réinitialisation de mot de passe vous a été envoyé.<br/>Pensez à vérifier vos spams !' }
        this.sendResetPasswordLoading = false
      }).catch((err) => {
        this.resetPasswordNotif = { variant: 'negative', message: translate().translateResetPasswordError(err, 'Une erreur est survenue lors de l\'envoi de l\'email de réinitialisation de mot de passe') }
        this.sendResetPasswordLoading = false
      })
    },
    onsubmit() {
      this.loading = true
      this.$refs.loginForm.validate().then((success) => {
        if (success) {
          login(this.form.email, this.form.password).then(() => {
              this.$router.push({ name: 'index' })
              successNotify('Vous êtes désormais connecté')
            }).catch((err) => {
              this.loading = false
              errorNotify(translate().translateSigninError(err))
            })
        } else {
          // console.log('error')
          this.loading = false
        }
      })
    },
    continueAsGuest() {
      Dialog.create({
        title: 'Continuer en tant qu\'invité',
        message: '<b>Tu ne pourra pas retouver tes données depuis un autre appareil, et si tu désinstalles l\'application, tu perdras toutes tes données.</b><br/>Tu ne pourra pas non plus te connecter plus tard pour sauvegarder tes données en ligne.',
        html: true,
        ok: {
          label: 'Continuer',
          color: 'primary'
        },
        cancel: {
          label: 'Annuler',
          color: 'negative'
        }
      }).onOk(() => {
        loginAsGuest()
        this.$router.push({ name: 'index' })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.bg-primary .q-card {
  background: none;
}
.page {
  width: 300px;
}
</style>
