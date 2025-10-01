import firestore from '@react-native-firebase/firestore';
import { SessionModel, Session } from "./model/Session"; // Adjust path as needed

const SESSION_COLLECTION = 'sessions';
const db = firestore();

// Adds a new session to Firestore
export async function addSessionToFirestore(sessionData: Omit<Session, 'docId' | 'createdBy' | 'uid' | 'timestamp'>, uid: string, email: string): Promise<string> {
    const session = new SessionModel({
        ...sessionData,
        uid: uid,
        createdBy: email,
        // Use serverTimestamp for accuracy in Firestore
        timestamp: firestore.FieldValue.serverTimestamp() as unknown as Date,
    });

    try {
        const docRef = await db.collection(SESSION_COLLECTION).add(session.toFirestore());
        return docRef.id;
    } catch (error) {
        console.error("Error adding session to Firestore:", error);
        throw new Error("Failed to publish session to database.");
    }
}

// Gets all sessions from Firestore, ordered by most recent
export async function getSessionListFromFirestore(): Promise<SessionModel[]> {
    const sessionList: SessionModel[] = [];
    
    try {
        const querySnapshot = await db.collection(SESSION_COLLECTION)
            .orderBy('timestamp', 'desc')
            .get();

        querySnapshot.forEach(doc => {
            const data = doc.data();
            
            // Convert Firestore Timestamp to JavaScript Date
            const timestamp = data.timestamp?.toDate() || new Date();

            const s = new SessionModel({ 
                ...data as Session, 
                timestamp: timestamp 
            });
            s.set_docId(doc.id);
            sessionList.push(s);
        });
        return sessionList;
    } catch (error) {
        console.error("Error fetching sessions from Firestore:", error);
        throw new Error("Failed to fetch sessions from the database.");
    }
}

export function updateSession() {
    
}