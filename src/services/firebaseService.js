import { set, ref, onValue, remove, update, off, get } from 'firebase/database'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { getUser, initUser } from './userService'
import { LocalStorage } from 'quasar'
import { auth, db} from 'src/boot/firebase'
import { USER_GUEST_UID } from 'src/helpers/userHelper'
import { LOCALSTORAGE_DB_SHARED } from 'src/helpers/databaseHelper'

export  function retrieveData(refStr) {
  const dataRef = ref(db, refStr)
  return get(dataRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val()
      } else {
        return null
      }
    })
    .catch((error) => {
      throw new Error(error)
    })
}

export function createData(refStr, data) {
  data = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  return set(ref(db, refStr), data)
}

export function updateData(refStr, data, timestamp = true) {
  data = timestamp ? {
    ...data,
    updatedAt: new Date().toISOString()
  } : {...data}
  return update(ref(db, refStr), data)
}

export function removeData(refStr) {
  return remove(ref(db, refStr))
}

export function initData(refStr, localStorageKey, initValue = null) {
  if (getUser() && getUser().uid ===  USER_GUEST_UID) return
  const dataRef = ref(db, refStr)
  return onValue(dataRef, (snapshot) => {
    const data = snapshot.val()
    if (localStorageKey) {
      LocalStorage.set(localStorageKey, initValue && !data ? initValue : data)
    }
  })
}

export function removeListenner(refStr) {
  const dataRef = ref(db, refStr)
  return off(dataRef)
}

export function registerUser(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    initUser()
    return userCredential.user
  })
  .catch((error) => {
    throw new Error(error)
  })
}

export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    initUser()
    return userCredential.user
  })
  .catch((error) => {
    throw new Error(error)
  })
}

export function initShareBD() {
  initData('shared', LOCALSTORAGE_DB_SHARED, {})
}
