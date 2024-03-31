<template>
  <q-page class="flex flex-center page">
    <div class="page-content column items-center">
      <GymyHeader text="Compte" />
      <div class="w-100" v-if="user">
        <div class="w-100 flex account-info-line row no-wrap" v-if="user.uid !== USER_GUEST_UID">
          <div class="w-50 text-bold text-right">
            Nom d'utilisateur
          </div>
          <div class="w-50 text-left">
            {{ user.username }}
          </div>
        </div>
        <div class="w-100 flex account-info-line row no-wrap" v-if="user.uid !== USER_GUEST_UID">
          <div class="w-50 text-bold text-right">
            Email
          </div>
          <div class="w-50 text-left">
            {{ user.email }}
          </div>
        </div>
        <div class="w-100 flex account-info-line row no-wrap">
          <div class="w-50 text-bold text-right">
            Nombre de séries par défaut
          </div>
          <div class="w-50 text-left">
            {{ user.defaultNumberOfSeries }}
          </div>
        </div>
        <div class="w-100 flex account-info-line row no-wrap">
          <div class="w-50 text-bold text-right">
            Temps de repos
          </div>
          <div class="w-50 text-left">
            {{ formatting().durationFormatFromString(user.restTime) }}
          </div>
        </div>
      </div>
      <q-btn @click="showEditDefaultNumberOfSeries = true" color="primary" class="w-content q-mt-lg">Modifier le nombre de séries par défaut</q-btn>
      <q-btn @click="showEditRestTime = true" color="primary" class="w-content q-mt-lg">Modifier le temps de repos</q-btn>
      <q-btn @click="() => {initUpdatePasswordForm(); showUpdatePassword = true}" color="primary" class="w-content q-mt-lg" v-if="user.uid !== USER_GUEST_UID">Modifier son mot de passe</q-btn>
      <q-btn @click="() => {initSignupAsGuestForm(); showSignupAsGuest = true}" color="primary" class="w-content q-mt-lg" v-if="user.uid === USER_GUEST_UID">S'inscrire</q-btn>
      <q-btn @click="logout" color="negative" class="w-content q-mt-xl">Se déconnecter</q-btn>
      <q-btn @click="deleteAccount" color="negative" class="w-content q-mt-xl" v-if="user.uid !== USER_GUEST_UID">Supprimer mon compte</q-btn>
      <q-dialog v-model="showEditDefaultNumberOfSeries">
        <q-card class="q-px-xs q-py-xs">
          <q-card-section align="center">
            <div class="text-h6 text-center">Modifier votre nombre de série par défaut</div>
          </q-card-section>
          <q-card-section align="center" class="column">
            <q-form ref="defaultNumberOfSeriesForm" @submit.prevent="submitDefaultNumberOfSeries">
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
                :disable="!newDefaultNumberOfSeriesValid"
                :loading="defaultNumberOfSeriesLoading"
                color="primary"
              />
            </q-form>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn label="Annuler" color="negative" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="showSignupAsGuest">
        <q-card class="q-pa-md w-100">
          <q-card-section align="center">
            <div class="text-h6 text-center">S'inscrire</div>
          </q-card-section>
          <q-card-section align="center" class="column">
            <q-form ref="signupAsGuestForm" @submit.prevent="submitSignupAsGuest">
              <q-input
                name="username"
                rounded
                outlined
                label="Nom d'utilisateur*"
                class="q-mb-md"
                type="text"
                v-model="signupAsGuestForm.username"
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
                v-model="signupAsGuestForm.email"
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
                :type="signupAsGuestForm.password.show ? 'text' : 'password'"
                v-model="signupAsGuestForm.password.value"
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
                    :name="signupAsGuestForm.password.show ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    color="primary"
                    @click="signupAsGuestForm.password.show = !signupAsGuestForm.password.show"
                  />
                </template>
              </q-input>
              <q-input
                name="confirmPassword"
                rounded
                outlined
                label="Confirmation du mot de passe*"
                class="q-mb-md"
                :type="signupAsGuestForm.confirmPassword.show ? 'text' : 'password'"
                v-model="signupAsGuestForm.confirmPassword.value"
                lazy-rules
                :rules="[
                  (val) => val.trim().length > 0 || 'Veuillez remplir ce champ',
                  (val) =>
                    val === signupAsGuestForm.password.value || 'Veuillez confirmer votre mot de passe'
                ]"
                hide-bottom-space
              >
                <template v-slot:append>
                  <q-icon
                    :name="signupAsGuestForm.confirmPassword.show ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    color="primary"
                    @click="signupAsGuestForm.confirmPassword.show = !signupAsGuestForm.confirmPassword.show"
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
                v-model="signupAsGuestForm.defaultNumberOfSeries"
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
                v-model="signupAsGuestForm.restTime"
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
                :class="`form-btn btn btn-${signupAsGuestValid ? 'primary' : 'disabled'}`"
                :disable="!signupAsGuestValid"
                rounded
                :loading="signupAsGuestLoading"
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
      <q-dialog v-model="showEditRestTime">
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
                :disable="!newRestTimeValid"
                :loading="restTimeLoading"
                color="primary"
              />
            </q-form>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn label="Annuler" color="negative" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="showUpdatePassword">
        <q-card class="q-px-xs q-py-xs update-password-modal">
          <q-card-section align="center">
            <div class="text-h6 text-center">Modifier votre mot de passe</div>
          </q-card-section>
          <q-card-section align="center" class="column">
            <q-form ref="updatePasswordForm" @submit.prevent="updatePassword">
              <q-input
                name="password"
                outlined
                label="Ancien mot de passe"
                class="q-mb-md w-100"
                bg-color="white"
                :type="updatePasswordForm.current.show ? 'text' : 'password'"
                v-model="updatePasswordForm.current.value"
                lazy-rules
                autofocus
                :rules="[(val) => val.trim().length > 0 || 'Veullez remplir ce champ']"
                hide-bottom-space
              >
                <template v-slot:append>
                  <q-icon
                    :name="updatePasswordForm.current.show ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    color="primary"
                    @click="updatePasswordForm.current.show = !updatePasswordForm.current.show"
                  />
                </template>
              </q-input>
              <q-input
                name="password"
                outlined
                label="Nouveau mot de passe"
                class="q-mb-md w-100"
                bg-color="white"
                :type="updatePasswordForm.new.show ? 'text' : 'password'"
                v-model="updatePasswordForm.new.value"
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
                    :name="updatePasswordForm.new.show ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    color="primary"
                    @click="updatePasswordForm.new.show = !updatePasswordForm.new.show"
                  />
                </template>
              </q-input>
              <q-input
                name="confirmPassword"
                outlined
                label="Confirmation du nouveau mot de passe"
                class="q-mb-md w-100"
                bg-color="white"
                :type="updatePasswordForm.confirmNew.show ? 'text' : 'password'"
                v-model="updatePasswordForm.confirmNew.value"
                lazy-rules
                :rules="[
                  (val) => val.trim().length > 0 || 'Veullez remplir ce champ',
                  (val) => val === updatePasswordForm.new.value || 'Veuillez confirmer votre nouveau mot de passe'
                ]"
                hide-bottom-space
              >
                <template v-slot:append>
                  <q-icon
                    :name="updatePasswordForm.confirmNew.show ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    color="primary"
                    @click="updatePasswordForm.confirmNew.show = !updatePasswordForm.confirmNew.show"
                  />
                </template>
              </q-input>
              <q-btn
                label="Enregistrer"
                type="submit"
                :disable="!updatePasswordValid"
                :loading="updatePasswordLoading"
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
  </q-page>
</template>

<script>
import { deleteAllUserData, logout, logout as logoutFirebase, signup, updatePassword as updatePasswordFirebase } from 'src/services/authService'
import GymyHeader from 'src/components/GymyHeader.vue'
import { getUser, updateUser } from 'src/services/userService'
import { errorNotify, successNotify } from 'src/helpers/notifyHelper'
import { Dialog } from 'quasar'
import formatting from 'src/helpers/formatting'
import { USER_GUEST_UID } from 'src/helpers/userHelper'
import translatting from 'src/helpers/translatting'
import { formatUserLocalStorageDatabase } from 'src/helpers/databaseHelper'

export default {
  name: 'AccountPage',
  components: {
    GymyHeader
  },
  setup() {
    return {
      formatting,
      USER_GUEST_UID
    }
  },
  data() {
    return {
      user: null,
      newDefaultNumberOfSeries: null,
      showEditDefaultNumberOfSeries: false,
      defaultNumberOfSeriesLoading: false,
      newRestTime: null,
      showEditRestTime: false,
      restTimeLoading: false,
      newRestTimeValid: false,
      showUpdatePassword: false,
      updatePasswordLoading: false,
      updatePasswordForm: {
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
      },
      showSignupAsGuest: false,
      signupAsGuestLoading: false,
      signupAsGuestForm: {
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
      signupAsGuestValid: true
    }
  },
  created() {
    this.loadUser()
  },
  computed: {
    newDefaultNumberOfSeriesValid() {
      return this.newDefaultNumberOfSeries !== null && this.newDefaultNumberOfSeries !== '' && this.newDefaultNumberOfSeries >= 1
    },
    updatePasswordValid() {
      return this.updatePasswordForm.current.value.trim().length > 0 && this.updatePasswordForm.new.value.trim().length > 0 && this.updatePasswordForm.confirmNew.value.trim().length > 0 && this.updatePasswordForm.new.value === this.updatePasswordForm.confirmNew.value
    }
  },
  watch: {
    newRestTime() {
      if (this.$refs.restTimeForm && this.newRestTime) {
        this.$refs.restTimeForm.validate().then((res) => {
          this.newRestTimeValid = res
        }).catch(() => {
          this.newRestTimeValid = false
        })
      } else if (this.newRestTime) {
        this.newRestTimeValid = true
      } else {
        this.newRestTimeValid = false
      }
    }
  },
  methods: {
    submitSignupAsGuest() {
      this.$refs.signupAsGuestForm.validate().then((res) => {
        this.signupAsGuestValid = res
        if (res) {
          this.signupAsGuestLoading = true
          const currentUserData = formatUserLocalStorageDatabase(getUser())
          signup(this.signupAsGuestForm.email.trim(), this.signupAsGuestForm.password.value.trim(), this.signupAsGuestForm.username.trim(), this.signupAsGuestForm.defaultNumberOfSeries, this.signupAsGuestForm.restTime, currentUserData).then(() => {
            logout().then(() => {
              this.$router.push({ name: 'login' })
            })
            successNotify('Votre inscription a bien été prise en compte')
          }).catch((err) => {
            errorNotify(translatting().translateSignupError(err, 'Une erreur est survenue lors de votre inscription'))
            this.signupAsGuestLoading = false
          })
        }
      })
    },
    initSignupAsGuestForm() {
      this.signupAsGuestForm = {
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
    },
    initUpdatePasswordForm() {
      this.updatePasswordForm = {
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
    updatePassword () {
      if (!this.updatePasswordValid) return
      this.updatePasswordLoading = true
      updatePasswordFirebase(this.updatePasswordForm.current.value.trim(), this.updatePasswordForm.new.value.trim()).then(() => {
        successNotify('Votre mot de passe a bien été mis à jour')
        this.initUpdatePasswordForm()
        this.showUpdatePassword = false
        this.updatePasswordLoading = false
      }).catch((err) => {
        errorNotify(translatting().translateUpdatePasswordError(err, 'Une erreur est survenue lors de la mise à jour de votre mot de passe'))
        this.updatePasswordLoading = false
      })
    },
    loadUser() {
      this.user = getUser()
      this.newDefaultNumberOfSeries = this.user.defaultNumberOfSeries
      this.newRestTime = this.user.restTime
    },
    submitDefaultNumberOfSeries() {
      if (!this.newDefaultNumberOfSeriesValid) return
      this.defaultNumberOfSeriesLoading = true
      updateUser({ defaultNumberOfSeries: Number(this.newDefaultNumberOfSeries) }).then(() => {
        this.loadUser()
        this.defaultNumberOfSeriesLoading = false
        this.showEditDefaultNumberOfSeries = false
        successNotify('Votre nombre de série par défaut a bien été modifié')
      }).catch((err) => {
        this.defaultNumberOfSeriesLoading = false
        errorNotify('Une erreur est survenue lors de la modification de votre nombre de série par défaut')
      })
    },
    submitRestTime() {
      if (!this.newRestTimeValid) return
      this.restTimeLoading = true
      updateUser({ restTime: formatting().durationFormatFromString(this.newRestTime) }).then(() => {
        this.loadUser()
        this.restTimeLoading = false
        this.showEditRestTime = false
        successNotify('Votre nombre de série par défaut a bien été modifié')
      }).catch((err) => {
        this.restTimeLoading = false
        errorNotify('Une erreur est survenue lors de la modification de votre nombre de série par défaut')
      })
    },
    deleteAccount() {
      let deleteLoading = false
      Dialog.create({
        title: 'Supprimer mon compte',
        message: 'Toutes vos données seront perdues et cette action est irréversible.',
        cancel: {
          label: 'Annuler',
          color: 'primary'
        },
        ok: {
          label: 'Supprimer',
          color: 'negative',
          loading: deleteLoading
        }
      }).onOk(() => {
        deleteLoading = true
        deleteAllUserData().then(() => {
          this.$router.push({ name: 'login' })
        }).catch(() => {
          deleteLoading = false
          errorNotify('Une erreur est survenue lors de la suppression de votre compte')
        })
      })
    },
    logout() {
      if (this.user.uid === USER_GUEST_UID) {
        return Dialog.create({
          title: 'Se déconnecter en tant qu\'invité',
          message: 'Toutes vos données seront perdues et cette action est irréversible.',
          cancel: {
            label: 'Annuler',
            color: 'primary'
          },
          ok: {
            label: 'se déconnecter',
            color: 'negative'
          }
        }).onOk(() => {
          logoutFirebase().then(() => {
            this.$router.push({ name: 'login' })
          })
        })
      }
      logoutFirebase().then(() => {
        this.$router.push({ name: 'login' })
      })
    }
  }
}
</script>

<styles scoped lang="scss">
.account-info-line {
  gap: 10px;
}
.update-password-modal {
  width: 500px;
}
</styles>
