import app from './firebase';

import {
    addDoc,
    updateDoc,
    deleteDoc,
    getFirestore
} from 


const db = getFirestore(app);
const SESSIONS_COLLECTION = 'sessions';

