import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged as fbOnAuthStateChanged,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { dataUriToBlob } from '../utils/imageUtils';

const firebaseConfig = {
  apiKey: "AIzaSyDAaCHRb102Pur-LDv1Ar4v41kLVybNstQ",
  authDomain: "ams-v3-60d75.firebaseapp.com",
  projectId: "ams-v3-60d75",
  storageBucket: "ams-v3-60d75.firebasestorage.app",
  messagingSenderId: "756019115120",
  appId: "1:756019115120:web:ce9cebaaac46f993ddf0b5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export type User = FirebaseUser;

export const onAuthStateChanged = fbOnAuthStateChanged;
export const logout = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

export const setPersistencePreference = (rememberMe: boolean) => 
  setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

export { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile };

/**
 * Uploads a base64 string or Blob to Firebase Storage and returns the download URL.
 * Optimized for 4K assets by converting Data URIs to Blobs before transit.
 */
export const uploadImage = async (userId: string, source: string | Blob, folder: string = 'general'): Promise<string> => {
  if (typeof source === 'string' && source.startsWith('http')) return source;

  try {
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const storageRef = ref(storage, `users/${userId}/${folder}/${filename}`);
    
    let blob: Blob;
    let contentType = 'image/png';

    if (typeof source === 'string') {
        const result = dataUriToBlob(source);
        blob = result.blob;
        contentType = result.mimeType;
    } else {
        blob = source;
        contentType = source.type;
    }
    
    await uploadBytes(storageRef, blob, { contentType });
    return await getDownloadURL(storageRef);
  } catch (error: any) {
    console.error("Storage upload error:", error);
    throw error;
  }
};

// --- Firestore Helpers ---
export const subscribeToCollection = (userId: string, collectionName: string, callback: (data: any[]) => void) => {
  const q = query(collection(db, `users/${userId}/${collectionName}`));
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(doc => doc.data())), (err) => console.error(err));
};

export const subscribeToDocument = (userId: string, collectionName: string, docId: string, callback: (data: any) => void) => {
  return onSnapshot(doc(db, `users/${userId}/${collectionName}`, docId), (snap) => callback(snap.exists() ? snap.data() : null), (err) => console.error(err));
};

export const saveDocument = async (userId: string, collectionName: string, docId: string, data: any) => {
  await setDoc(doc(db, `users/${userId}/${collectionName}`, docId), data, { merge: true });
};

export const deleteDocument = async (userId: string, collectionName: string, docId: string) => {
  await deleteDoc(doc(db, `users/${userId}/${collectionName}`, docId));
};

export const addArrayItem = async (userId: string, collectionName: string, docId: string, fieldName: string, item: any) => {
  const docRef = doc(db, `users/${userId}/${collectionName}`, docId);
  await updateDoc(docRef, { [fieldName]: arrayUnion(item) });
};

export const migrateLocalData = async (userId: string) => {
  const collections = [
    { key: 'app_brands_v5', name: 'brands' },
    { key: 'app_products_v5', name: 'products' },
    { key: 'app_stylePresets_v5', name: 'stylePresets' },
    { key: 'app_batchJobs_v5', name: 'batchJobs' },
    { key: 'app_systemInstructions_v5', name: 'systemInstructions', single: true }
  ];

  const batch = writeBatch(db);
  let operationCount = 0;

  for (const col of collections) {
    const localData = localStorage.getItem(col.key);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (col.single) {
         batch.set(doc(db, `users/${userId}/settings`, col.name), parsed);
         operationCount++;
      } else if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item.id) {
            batch.set(doc(db, `users/${userId}/${col.name}`, item.id), item);
            operationCount++;
          }
        }
      }
    }
  }

  if (operationCount > 0) await batch.commit();
  return operationCount > 0;
};