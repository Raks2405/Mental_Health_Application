// Located, for example, at: '../model/Session.js'

export class Session {
    constructor(data) {
        // Ensure properties exist, using default values where necessary
        this.title = data.title;
        this.description = data.description;
        this.date = data.date;
        this.time = data.time;
        this.location = data.location;
        this.createdBy = data.createdBy; 
        this.uid = data.uid;
        this.timestamp = data.timestamp || new Date(); 
        this.docId = data.docId || null;
    }

    // Method to format the object for writing to Firestore
    toFirestore() {
        return {
            title: this.title,
            description: this.description,
            date: this.date,
            time: this.time,
            location: this.location,
            createdBy: this.createdBy,
            uid: this.uid,
            timestamp: this.timestamp,
        };
    }

    set_docId(docId) {
        this.docId = docId;
    }
}