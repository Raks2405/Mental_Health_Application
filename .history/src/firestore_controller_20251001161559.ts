// src/firestore_controller.ts
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Session {
  docId?: string;
  title: string;
  description: string;
  date: string;   // formatted date text you store from UI
  time: string;   // formatted time text
  location: string;
  createdBy: string; // email or uid
  timestamp: Date;   // JS Date for your model (Firestore stores Timestamp)
}

const SESSIONS = 'sessions';

// CREATE
export async function addSessionToFirestore(
  data: Omit<Session, 'docId' | 'timestamp'>,
) {
  const payload = {
    ...data,
    timestamp: serverTimestamp(), // server time in Firestore
  };
  const docRef = await addDoc(collection(db, SESSIONS), payload);
  return docRef.id;
}

// READ (newest first)
export async function getSessionListFromFirestore(): Promise<Session[]> {
  const q = query(collection(db, SESSIONS), orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const raw = d.data() as any;
    const ts: Timestamp | undefined = raw.timestamp;
    return {
      docId: d.id,
      title: raw.title ?? '',
      description: raw.description ?? '',
      date: raw.date ?? '',
      time: raw.time ?? '',
      location: raw.location ?? '',
      createdBy: raw.createdBy ?? '',
      timestamp: ts ? ts.toDate() : new Date(0),
    };
  });
}
