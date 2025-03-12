<template>
  <div>
    <q-btn
      @click="show = true"
      color="primary"
      class="w-content"
      >Modifier mon adresse e-mail</q-btn
    >
    <q-dialog v-model="show">
      <q-card class="q-px-md q-py-xs">
        <q-card-section align="center">
          <div class="text-h6 text-center">Modifier votre adresse e-mail</div>
        </q-card-section>
        <q-card-section
          align="center"
          class="column"
        >
          <q-form
            ref="updateUserEmailForm"
            @submit.prevent="submit"
          >
            <q-input
              name="email"
              outlined
              class="q-mb-md"
              type="email"
              inputmode="email"
              v-model="form.newEmail"
              :rules="[(val, rules) => rules.email(val) || 'Veuillez renseigner une adresse e-mail valide']"
              label="Nouvelle adresse e-mail"
              lazy-rules
              hide-bottom-space
            >
            </q-input>
            <q-input
              name="password"
              outlined
              label="Mot de passe"
              class="q-mb-md"
              :type="form.password.show ? 'text' : 'password'"
              v-model="form.password.value"
              lazy-rules
              :rules="[(val) => val.trim().length > 0 || 'Veuillez remplir ce champ']"
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
          <q-btn
            label="Annuler"
            color="negative"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { updateEmail } from 'src/services/userService'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import translatting from 'src/helpers/translatting'

export default {
  name: 'UpdateEmail',
  emits: ['reloadUser'],
  data() {
    return {
      form: {
        newEmail: null,
        password: {
          value: null,
          show: false
        }
      },
      show: false,
      loading: false,
      isValid: false
    }
  },
  watch: {
    form: {
      handler() {
        if (this.$refs.updateUserEmailForm && this.form.newEmail && this.form.newEmail.trim().length > 0 && this.form.password.value && this.form.password.value.trim().length > 0) {
          this.$refs.updateUserEmailForm
            .validate()
            .then((res) => {
              this.isValid = res
            })
            .catch(() => {
              this.isValid = false
            })
        } else {
          this.isValid = false
        }
      },
      deep: true
    }
  },
  methods: {
    submit() {
      if (!this.isValid) return
      this.loading = true
      updateEmail(this.form.password.value, this.form.newEmail)
        .then(() => {
          this.$emit('reloadUser')
          this.loading = false
          this.show = false
          successNotify('Une demande de modification de votre adresse e-mail a été envoyée. Veuillez vérifier votre boîte mail pour confirmer votre nouvelle adresse e-mail')
        })
        .catch((err) => {
          this.loading = false
          errorNotify(translatting().translateUpdateUserEmailError(err, 'Une erreur est survenue lors de la modification de votre email'))
        })
    }
  }
}
</script>

<styles scoped lang="scss"></styles>
