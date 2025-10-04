import firestore from '@react-native-firebase/firestore';

// Define the structure of a single Session object
export interface Session {
    docId?: string; // Optional Firestore document ID
    title: string;
    description: string;
    date: string; // Formatted date string
    time: string; // Formatted time string
    location: string;
    createdBy: string; // User email
    timestamp: Date;
    startMillis: number // JavaScript Date object
}

// Helper class for handling data consistency when talking to Firestore
export class SessionModel {
    docId?: string;
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    createdBy: string;
    timestamp: Date;
    startMillis: number;

    constructor(data: Partial<Session> & { timestamp: Date | null }) {
        this.title = data.title || '';
        this.date = data.date || '';
        this.time = data.time || '';
        this.location = data.location || '';
        this.description = data.description || "No description provided";
        this.createdBy = data.createdBy || '';
        this.timestamp = data.timestamp || new Date();
        const parsed =
            Number.isFinite(data?.startMillis as number)
                ? (data!.startMillis as number)
                : Date.parse(`${this.date} ${this.time}`);

        this.startMillis = Number.isFinite(parsed) ? parsed : 0;

        this.docId = data.docId || undefined;

    }

    // Method to format the object for writing to Firestore (removes docId and converts Date)
    toFirestore(): Omit<Session, 'docId'> {
        return {
            title: this.title,
            date: this.date,
            time: this.time,
            location: this.location,
            description: this.description,
            createdBy: this.createdBy,
            timestamp: this.timestamp,
            startMillis: this.startMillis,
            // Firestore expects a Date object here, which it converts
        };
    }

    set_docId(docId: string): void {
        this.docId = docId;
    }
}