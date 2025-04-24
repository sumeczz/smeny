"use client"

import { initializeApp } from "firebase/app"
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  deleteDoc,
} from "firebase/firestore"
import { firebaseConfig } from "./firebase-config"

// Inicializace Firebase pouze na klientské straně
let app, auth, db, provider

// Inicializace Firebase
const initFirebase = () => {
  if (typeof window !== "undefined" && !app) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    provider = new GoogleAuthProvider()
  }
}

// Přihlášení pomocí Google účtu
export const signInWithGoogle = async () => {
  initFirebase()
  try {
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (error) {
    console.error("Chyba při přihlašování:", error)
    throw error
  }
}

// Odhlášení
export const signOut = async () => {
  initFirebase()
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error("Chyba při odhlašování:", error)
    throw error
  }
}

// Získání aktuálního uživatele
export const getCurrentUser = (): User | null => {
  initFirebase()
  return auth?.currentUser || null
}

// Naslouchání změnám stavu autentizace
export const onAuthChange = (callback: (user: User | null) => void) => {
  initFirebase()
  return onAuthStateChanged(auth, callback)
}

// Uložení zálohy do Firestore
export const saveBackup = async (userId: string, data: any, name = "Automatická záloha") => {
  initFirebase()
  try {
    const backupRef = doc(collection(db, "backups"))
    await setDoc(backupRef, {
      userId,
      data,
      name,
      createdAt: Timestamp.now(),
    })
    return backupRef.id
  } catch (error) {
    console.error("Chyba při ukládání zálohy:", error)
    throw error
  }
}

// Získání všech záloh uživatele
export const getUserBackups = async (userId: string) => {
  initFirebase()
  try {
    const backupsQuery = query(collection(db, "backups"), where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(backupsQuery)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    }))
  } catch (error) {
    console.error("Chyba při získávání záloh:", error)
    throw error
  }
}

// Získání konkrétní zálohy
export const getBackup = async (backupId: string) => {
  initFirebase()
  try {
    const backupDoc = await getDoc(doc(db, "backups", backupId))
    if (backupDoc.exists()) {
      const data = backupDoc.data()
      return {
        id: backupDoc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
      }
    }
    return null
  } catch (error) {
    console.error("Chyba při získávání zálohy:", error)
    throw error
  }
}

// Smazání zálohy
export const deleteBackup = async (backupId: string) => {
  initFirebase()
  try {
    await deleteDoc(doc(db, "backups", backupId))
  } catch (error) {
    console.error("Chyba při mazání zálohy:", error)
    throw error
  }
}

// Získání poslední zálohy uživatele
export const getLastBackup = async (userId: string) => {
  initFirebase()
  try {
    const backupsQuery = query(
      collection(db, "backups"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(1),
    )
    const querySnapshot = await getDocs(backupsQuery)
    if (querySnapshot.empty) return null

    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    }
  } catch (error) {
    console.error("Chyba při získávání poslední zálohy:", error)
    throw error
  }
}
