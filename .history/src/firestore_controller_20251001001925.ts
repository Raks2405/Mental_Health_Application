import { app } from './firebase';

import {
    addDoc,
    deleteDoc,
    updateDoc,
} from 'firebase/firestore';

const db = getFirestore(app);
const SESSIONS_COLLECTION = 'sessions';

export async function addSession(){
    
}