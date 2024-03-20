import { set, ref, onValue, remove, update, off } from 'firebase/database'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { initUser } from './userService'
import { LocalStorage } from 'quasar'
import { auth, db} from 'src/boot/firebase'

export function retrieveData(refStr) {
  const dataRef = ref(db, refStr)
  return onValue(dataRef, (snapshot) => {
    return snapshot.val()
  })
}

export function createData(refStr, data) {
  set(ref(db, refStr), data).catch((error) => {
    throw new Error(error.message)
  })
}

export function updateData(refStr, data) {
  update(ref(db, refStr), data).catch((error) => {
    throw new Error(error.message)
  })
}

export function removeData(refStr) {
  remove(ref(db, refStr)).catch((error) => {
    throw new Error(error.message)
  })
}

export function initData(refStr, localStorageKey, initValue = null) {
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
    initUser(userCredential.user.uid)
    return userCredential.user
  })
  .catch((error) => {
    throw new Error(error)
  })
}

export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    initUser(userCredential.user.uid)
    return userCredential.user
  })
  .catch((error) => {
    throw new Error(error)
  })
}
