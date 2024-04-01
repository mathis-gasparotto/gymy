import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  deleteUser,
  updatePassword as updatePasswordFirebase,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth'
import { app, auth, db } from 'src/boot/firebase'
import { LocalStorage } from 'quasar'
import { addUser, checkUsername, getUser, initUser } from './userService'
import { initData, removeData, removeListenner } from './firebaseService'
import { LOCALSTORAGE_DATABASES, LOCALSTORAGE_DB_USER } from 'src/helpers/databaseHelper'
import { ref, update } from 'firebase/database'
import { USER_GUEST, USER_GUEST_UID } from 'src/helpers/userHelper'

export async function signup(email, password, username, defaultNumberOfSeries, restTime, payload = {}) {
  await checkUsername(username)
  await setPersistence(auth, browserLocalPersistence)
  const user = await createUserWithEmailAndPassword(auth, email.trim(), password.trim())
    .then(async (userCredential) => {
      sendEmailVerification(userCredential.user)
      payload = {
        ...payload,
        email: userCredential.user.email,
        defaultNumberOfSeries,
        restTime,
        lastLoginAt: new Date().toISOString()
      }
      return addUser(userCredential.user.uid, payload, username.trim())
        .then((res) => {
          initData('users/' + userCredential.user.uid, LOCALSTORAGE_DB_USER)
        })
        .catch((error) => {
          deleteAllUserData(userCredential.user.uid)
          throw new Error(error.message)
        })
    })
    .catch((error) => {
      throw new Error(error.message)
    })
}

export function loginAsGuest() {
  return LocalStorage.set(LOCALSTORAGE_DB_USER, USER_GUEST)
}

export async function login(email, password) {
  await setPersistence(auth, browserLocalPersistence)
  return signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      await LocalStorage.set(LOCALSTORAGE_DB_USER, userCredential.user)
      await initUser()
      await update(ref(db, 'users/' + userCredential.user.uid), {lastLoginAt: new Date().toISOString()}).catch((error) => {
        throw new Error(error.message)
      })
      return true
    })
    .catch((error) => {
      throw new Error(error.message)
    })
}

export async function logout() {
  if (getUser().uid ===  USER_GUEST_UID) {
    return LocalStorage.remove(LOCALSTORAGE_DB_USER)
  }
  const auth = getAuth(app)
  return auth
    .signOut()
    .then(() => {
      // removeListenner('users/' + LocalStorage.getItem(LOCALSTORAGE_DB_USER).uid)
      LOCALSTORAGE_DATABASES.forEach((db) => {
        LocalStorage.remove(db)
      })
      return true
    })
    .catch((error) => {
      throw new Error(error.message)
    })
}

export async function deleteAllUserData() {
  if (!auth.currentUser) return
  removeData('users/' + auth.currentUser.uid)
  await deleteUser(auth.currentUser).catch((error) => {
    throw new Error(error.message)
  })
}

export async function updatePassword(oldPass, newPass) {
  if (!auth.currentUser) return
  const user = auth.currentUser
  await signInWithEmailAndPassword(auth, user.email, oldPass)
  await auth.currentUser.reload()
  updatePasswordFirebase(user, newPass)
}

export async function sendResetPassword(email) {
  return await sendPasswordResetEmail(auth, email)
}
