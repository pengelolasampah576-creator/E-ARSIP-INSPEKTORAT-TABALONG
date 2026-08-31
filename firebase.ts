import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc, 
  getDocs,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Cloud Storage: this is where uploaded document files (PDF/DOCX) actually live.
// Files uploaded here get a public https download URL that works for ANY visitor
// of the site (not just the browser that uploaded the file).
export const storage = getStorage(app);

export {
  collection,
  onSnapshot,
  setDoc,
  doc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  writeBatch,
  storageRef,
  uploadBytesResumable,
  getDownloadURL
};
