import { auth } from 'src/boot/firebase'
import { LocalStorage } from 'quasar'
import { DEFAULT_NUMBER_OF_SERIES, DEFAULT_REST_TIME, USER_GUEST_UID } from 'src/helpers/userHelper'
import { createData, initData, removeData, removeListenner, retrieveData, updateData } from './firebaseService'
import { LOCALSTORAGE_DB_USER } from 'src/helpers/databaseHelper'
import { onAuthStateChanged, signInWithEmailAndPassword, verifyBeforeUpdateEmail } from 'firebase/auth'

export function getUser() {
  return LocalStorage.getItem(LOCALSTORAGE_DB_USER)
}

export async function addUser(userUid, payload, username) {
  payload = {
    username,
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  }

  let userPayload = {
    uid: userUid,
    username,
    ...payload,
    defaultNumberOfSeries: payload.defaultNumberOfSeries ? payload.defaultNumberOfSeries : DEFAULT_NUMBER_OF_SERIES,
    restTime: payload.restTime ? payload.restTime : DEFAULT_REST_TIME
  }

  const toReturn = {
    ...payload,
    ...userPayload,
    uid: userUid
  }

  createData('users/' + userUid, userPayload)

  return toReturn
}

export async function updateUser(payload, userUid = null) {
  const newData = {
    ...payload,
    updatedAt: new Date().toISOString()
  }
  const localUser = getUser()
  if (localUser && localUser.uid === USER_GUEST_UID) {
    LocalStorage.set(LOCALSTORAGE_DB_USER, {
      ...user,
      ...newData,
      updatedAt: new Date().toISOString()
    })
  } else {
    if (!userUid) {
      userUid = auth.currentUser.uid
    }
    await updateData('users/' + userUid, newData)
  }

  return newData
}

export async function deleteUser() {
  const localUser = getUser()
  if (localUser && localUser.uid !== USER_GUEST_UID) {
    await removeData('users/' + auth.currentUser.uid)
  }
  LocalStorage.remove(LOCALSTORAGE_DB_USER)
}

export async function initUser() {
  if (getUser() && getUser().uid === USER_GUEST_UID) return
  onAuthStateChanged(auth, async (user) => {
    if (user && !user.emailVerified) {
      const localUser = getUser()
      if (localUser) removeListenner('users/' + localUser.uid)
      return LocalStorage.remove(LOCALSTORAGE_DB_USER)
    }
    if (user && user.uid) {
      initData('users/' + user.uid, LOCALSTORAGE_DB_USER)
      const dbUser = await retrieveData('users/' + user.uid)
      if (dbUser && dbUser.email !== user.email) {
        return updateUser({ email: user.email })
      }
      return
    } else {
      const localUser = getUser()
      if (localUser) removeListenner('users/' + localUser.uid)
      return LocalStorage.remove(LOCALSTORAGE_DB_USER)
    }
  })
}

export async function checkUsername(username) {
  const users = await retrieveData('users')
  if (users && Object.values(users).find((u) => u.username == username)) {
    throw new Error("Nom d'utilisateur déjà utilisé")
  }
}

export async function updateUsername(username) {
  await checkUsername(username)
  return updateUser({ username })
}

export async function updateEmail(password, email) {
  const userCredential = await signInWithEmailAndPassword(auth, getUser().email, password)
  return verifyBeforeUpdateEmail(userCredential.user, email)
}
