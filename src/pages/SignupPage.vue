<template>
  <div class="flex flex-center column page">
    <p class="text-h6 q-py-md bg-primary text-center text-bold title">
      Inscription
    </p>
    <q-form class="flex flex-center column form signup-form" ref="signupForm" @submit.prevent="onsubmit()">
      <q-input
        name="username"
        rounded
        outlined
        label="Nom d'utilisateur*"
        autofocus
        class="q-mb-md signup-input"
        bg-color="white"
        type="text"
        v-model="form.username"
        lazy-rules
        :rules="[
          (val) => val.trim().length > 3 || 'Veullez renseigner minimum 4 caractères'
        ]"
        hide-bottom-space
      ></q-input>
      <q-input
        name="email"
        rounded
        outlined
        label="Addresse email*"
        class="q-mb-md signup-input"
        bg-color="white"
        type="email"
        v-model="form.email"
        lazy-rules
        :rules="[
          (val, rules) =>
            rules.email(val) || 'Veullez rensigner une addresse email valide'
        ]"
        hide-bottom-space
      ></q-input>
      <q-input
        name="password"
        rounded
        outlined
        label="Mot de passe*"
        class="q-mb-md signup-input"
        bg-color="white"
        :type="showPassword ? 'text' : 'password'"
        v-model="form.password"
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
            :name="showPassword ? 'visibility' : 'visibility_off'"
            class="cursor-pointer"
            color="primary"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>
      <q-input
        name="confirmPassword"
        rounded
        outlined
        label="Confirmation du mot de passe*"
        class="q-mb-md signup-input"
        bg-color="white"
        :type="showConfirmPassword ? 'text' : 'password'"
        v-model="form.confirmPassword"
        lazy-rules
        :rules="[
          (val) => val.trim().length > 0 || 'Veullez remplir ce champ',
          (val) =>
            val === form.password || 'Veuillez confirmer votre mot de passe'
        ]"
        hide-bottom-space
      >
        <template v-slot:append>
          <q-icon
            :name="showConfirmPassword ? 'visibility' : 'visibility_off'"
            class="cursor-pointer"
            color="primary"
            @click="showConfirmPassword = !showConfirmPassword"
          />
        </template>
      </q-input>

      <p class="flex-end text-right signup-text">*Champ obligatoire</p>
      <!-- <div class="q-mb-md signup-toggle flex items-center ">
        <q-toggle v-model="form.minAgeCheck" class="">
        </q-toggle>
        <p class="q-mb-0">
          Je certifie d'avoir plus de 18 ans. J'ai lu et j'accepte les
          <span class="text-underline" @click="openURL(`${siteUrl}`)">conditions générales</span>.
        </p>
      </div>
      <div class="q-mb-md signup-toggle flex items-center ">
        <q-toggle v-model="form.newsletterCheck"/>
        <p class="q-mb-0">J'accepte de recevoir le bonus d'inscription, les offres spéciales et les informations de la part de Yessy.</p>
      </div> -->

      <q-btn
        label="S'inscrire"
        type="submit"
        :class="`form-btn btn btn-${validate ? 'primary' : 'disabled'}`"
        :disable="!validate"
        rounded
        :loading="loading"
        padding="sm 50px"
        size="20px"
      />
    </q-form>
    <p class="q-mt-lg">
      Tu as déjà un compte ?
      <router-link :to="{name: 'login'}" class="text-underline text-bold">Connecte toi</router-link>
    </p>
  </div>
</template>

<script>
import { signup } from 'src/services/authService'
import translate from '../helpers/translatting'
import { Notify, openURL } from 'quasar'

export default {
  name: 'SignupPage',
  setup() {
    return {
      openURL
    }
  },
  data() {
    return {
      form: {
        username: 'maggio',
        email: 'mathis.gasparotto@protonmail.com',
        password: 'Tatane!20022',
        confirmPassword: 'Tatane!20022',
        // minAgeCheck: false,
        // newsletterCheck: false
      },
      loading: false,
      validate: true,
      showPassword: false,
      showConfirmPassword: false,
      siteUrl: process.env.SITE_URL
    }
  },
  watch: {
    form: {
      handler() {
        if (
          // this.form.minAgeCheck &&
          this.form.username &&
          this.form.email &&
          this.form.password &&
          this.form.confirmPassword
        ) {
          this.$refs.signupForm.validate().then((success) => {
            if (success) {
              this.validate = true
            } else {
              this.validate = false
            }
          })
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
      this.$refs.signupForm.validate().then((success) => {
        if (success) {
          signup(
            this.form.email.trim(),
            this.form.password.trim(),
            this.form.username.trim(),
            // this.form.newsletterCheck
          )
            .then(() => {
              this.$router.push({ name: 'index' })
              Notify.create({
                message: 'Vous avez bien été inscrit',
                color: 'positive',
                icon: 'check_circle',
                position: 'top',
                timeout: 3000,
                actions: [
                  {
                    icon: 'close',
                    color: 'white'
                  }
                ]
              })
            })
            .catch((err) => {
              this.loading = false
              console.log(err)
              Notify.create({
                message: translate().translateSignupError(err),
                color: 'negative',
                icon: 'report_problem',
                position: 'top',
                timeout: 3000,
                actions: [
                  {
                    icon: 'close',
                    color: 'white'
                  }
                ]
              })
            })
        } else {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  width: 75%;
  color: white;
  border-radius: 15px;
}
.signup-toggle {
  flex-wrap: nowrap;
}
.page {
  width: 300px;
}
</style>
