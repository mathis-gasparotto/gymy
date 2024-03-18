import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  deleteUser
} from 'firebase/auth'
import { app, auth } from 'src/boot/firebase'
import { LocalStorage } from 'quasar'
import { addUser, getUser, updateUser } from './userService'
import { initData, removeData, retrieveData, updateData } from './firebaseService'
import { LOCALSTORAGE_DATABASES, LOCALSTORAGE_DB_USER } from 'src/helpers/database'

export async function signup(email, password, username) {
  const users = retrieveData('users')
  if (users && users.find((u) => u.username == username)) {
    throw new Error("Nom d'utilisateur déjà utilisé")
  }
  await setPersistence(auth, browserLocalPersistence)
  const user = await createUserWithEmailAndPassword(auth, email.trim(), password.trim())
    .then(async (userCredential) => {
      let payload = {
        email: userCredential.user.email,
        lastLoginAt: new Date().toISOString()
      }
      return addUser(userCredential.user.uid, payload, username.trim())
        .then((res) => {
          initData('users/' + userCredential.user.uid, LOCALSTORAGE_DB_USER)
        })
        .catch((error) => {
          cancelSignup(userCredential.user.uid)
          throw new Error(error.message)
        })
    })
    .catch((error) => {
      throw new Error(error.message)
    })
}

export async function login(email, password) {
  await setPersistence(auth, browserLocalPersistence)
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      initData('users/' + userCredential.user.uid, LOCALSTORAGE_DB_USER)
      const user = getUser()
      const newData = {
        ...user,
        lastLoginAt: new Date().toISOString()
      }
      updateData('users/' + userCredential.user.uid, newData)
      return true
    })
    .catch((error) => {
      throw new Error(error.message)
    })
}

export function logout() {
  const auth = getAuth(app)
  return auth
    .signOut()
    .then(() => {
      LOCALSTORAGE_DATABASES.forEach((db) => {
        LocalStorage.remove(db)
      })
      return true
    })
    .catch((error) => {
      throw new Error(error.message)
    })
}

export async function cancelSignup(userId) {
  removeData('users/' + userId)
  if (auth.currentUser) {
    await deleteUser(auth.currentUser).catch((error) => {
      throw new Error(error.message)
    })
  }
}
