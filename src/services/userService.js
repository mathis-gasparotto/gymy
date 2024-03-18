import { auth } from 'src/boot/firebase'
import { deleteUser } from 'firebase/auth'
import { LocalStorage } from 'quasar'
import { DEFAULT_NUMBER_OF_SERIES } from 'src/helpers/signupHelper'
import { createData, removeData, retrieveData, updateData } from './firebaseService'
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
    username,
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

export function initUser() {
  const user = getUser()
  if (user && user.uid) {
    initData('users/' + user.uid, LOCALSTORAGE_DB_USER)
  } else {
    LocalStorage.remove(LOCALSTORAGE_DB_USER)
  }
}
