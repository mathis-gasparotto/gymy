<template>
  <div class="login-page page">
    <q-img
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
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
        autofocus
        class="q-mb-md login-input"
        type="email"
        v-model="form.email"
        :rules="[
          (val, rules) =>
            rules.email(val) || 'Veullez rensigner une addresse email valide'
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
        :rules="[(val) => val.trim().length > 0 || 'Veullez remplir ce champ']"
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
      <q-card-section>
        <p class="q-my-xs text-center">
          Tu n'as pas de compte ?
          <router-link :to="{ name: 'signup' }" class="text-bold"
            >Inscris toi</router-link
          >
        </p>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { login } from 'src/services/authService'
import translate from 'src/helpers/translatting'
import { errorNotify, successNotify } from 'src/services/notify'

export default {
  name: 'LoginPage',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      showPassword: false,
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
