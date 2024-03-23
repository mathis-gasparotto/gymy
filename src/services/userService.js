import { auth } from 'src/boot/firebase'
import { LocalStorage } from 'quasar'
import { DEFAULT_NUMBER_OF_SERIES, DEFAULT_REST_TIME } from 'src/helpers/signupHelper'
import { createData, initData, removeData, updateData } from './firebaseService'
import { LOCALSTORAGE_DB_USER } from 'src/helpers/databaseHelper'

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
    email: payload.email,
    defaultNumberOfSeries: payload.defaultNumberOfSeries ? payload.defaultNumberOfSeries : DEFAULT_NUMBER_OF_SERIES,
    restTime: payload.restTime ? payload.restTime : DEFAULT_REST_TIME,
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

export async function updateUser(payload, userUid = null) {
  if (!userUid) {
    userUid = auth.currentUser.uid
  }
  const newData = {
    ...payload,
    updatedAt: new Date().toISOString()
  }
  updateData('users/' + userUid, newData)

  return newData
}

export async function deleteUser() {
  await removeData('users/' + auth.currentUser.uid)
  LocalStorage.remove(LOCALSTORAGE_DB_USER)
}

export async function initUser(uid = null) {
  if (uid) {
    return initData('users/' + uid, LOCALSTORAGE_DB_USER)
  }
  const user = await getUser()
  if (user && user.uid) {
    return initData('users/' + user.uid, LOCALSTORAGE_DB_USER)
  } else if (auth.currentUser) {
    return initData('users/' + auth.currentUser.uid, LOCALSTORAGE_DB_USER)
  } else {
    return LocalStorage.remove(LOCALSTORAGE_DB_USER)
  }
}
