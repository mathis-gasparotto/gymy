import { auth } from 'src/boot/firebase'
import { LocalStorage, uid } from 'quasar'
import { DEFAULT_NUMBER_OF_SERIES } from 'src/helpers/signupHelper'
import { createData, initData, removeData, updateData } from './firebaseService'
import { LOCALSTORAGE_DB_USER } from 'src/helpers/database'

export async function getUser() {
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
    email: payload.email,
    defaultNumberOfSeries: payload.defaultNumberOfSeries ? payload.defaultNumberOfSeries : DEFAULT_NUMBER_OF_SERIES,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
    lastLoginAt: payload.lastLoginAt
  }

  const toReturn = {
    ...payload,
    ...userPayload,
    uid: userUid
  }

  createData('users/' + userUid, userPayload)

  return toReturn
}

export function updateUser(userUid, payload) {
  const newData = {
    ...payload,
    updatedAt: new Date().toISOString()
  }
  updateData('users/' + userUid, newData)

  return newData
}

export async function deleteUser() {
  removeData('users/' + auth.currentUser.uid)
  LocalStorage.remove(LOCALSTORAGE_DB_USER)
}

export async function initUser(uid = null) {
  if (uid) {
    return initData('users/' + uid, LOCALSTORAGE_DB_USER)
  }
  const user = await getUser()
  if (user && user.uid) {
    return initData('users/' + user.uid, LOCALSTORAGE_DB_USER)
  } else {
    return LocalStorage.remove(LOCALSTORAGE_DB_USER)
  }
}
