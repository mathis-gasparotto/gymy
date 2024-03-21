import { set, ref, onValue, remove, update, off } from 'firebase/database'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { initUser } from './userService'
import { LocalStorage } from 'quasar'
import { auth, db} from 'src/boot/firebase'

export async function retrieveData(refStr) {
  const dataRef = ref(db, refStr)
  let data
  await onValue(dataRef, (snapshot) => {
    data = snapshot.val()
  })
  return data
}

export function createData(refStr, data) {
  data = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  set(ref(db, refStr), data).catch((error) => {
    throw new Error(error.message)
  })
}

export function updateData(refStr, data) {
  data = {
    ...data,
    updatedAt: new Date().toISOString()
  }
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
