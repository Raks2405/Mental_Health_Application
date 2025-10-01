import { app } from './firebase';

import {
    addDoc,
    deleteDoc,
    updateDoc,
    getFirestore
} from 'firebase/firestore';

import  Sessions  from '../app/(tabs)/sessions';

const db = getFirestore(app);
const SESSIONS_COLLECTION = 'sessions';

export async function addSession(){

}

export async function deleteSession() {
    
}

export async function updateSession() {
    
}