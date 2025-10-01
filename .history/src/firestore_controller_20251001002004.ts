import { app } from './firebase';

import {
    addDoc,
    deleteDoc,
    updateDoc,
} from 'firebase/firestore';

import { se}

const db = getFirestore(app);
const SESSIONS_COLLECTION = 'sessions';

export async function addSession(){

}