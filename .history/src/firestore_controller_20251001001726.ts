import app from './firebase';

import {
    addDoc,
    updateDoc,
    deleteDoc,
    getFirestore
} from 'firebase/app';


const db = getFirestore(app);
const SESSIONS_COLLECTION = 'sessions';

export async function addSession(){
    
}