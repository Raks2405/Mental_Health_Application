import firestore from '@react-native-firebase/firestore'
import { SessionModel, Session } from "./model/Session"; // Assuming path is correct

const SESSION_COLLECTION = 'sessions';
const db = firestore(); // Uses the initialized RNFB Firestore service

// 1. ADD SESSION (CREATE) - Now correctly includes UID
export async function addSessionToFirestore(
    sessionData: Omit<Session, 'docId' | 'createdBy' | 'uid' | 'timestamp'>, 
    uid: string, // REQUIRED: User ID for document security
    email: string // REQUIRED: User email for display/reference
): Promise<string> {
    
    // The SessionModel must be updated to accept UID in the constructor
    const session = new SessionModel({
        ...sessionData,
        uid: uid, // Pass UID
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

// 2. GET ALL SESSIONS (READ)
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