import { useCallback, useEffect, useState } from "react";
import { Alert, DeviceEventEmitter } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addSessionToFirestore,
  deleteSession,
  editSession,
  getSessionListFromFirestore,
} from "@/src/firestore_controller";
import { Session } from "@/src/Session";
import { useUser } from "@/src/UserContext";

export function useSessions() {
  const { user } = useUser();

  const [addSessions, setAddSessions] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState("");
  const [sessionLists, setSessionLists] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  const userKey = user?.email ?? "anon";
  const SEEN_KEY = `Sessions_seen_${userKey}`;

  // Seen cache (unchanged)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SEEN_KEY);
        if (mounted) setSeenIds(raw ? new Set(JSON.parse(raw)) : new Set());
      } catch {
        if (mounted) setSeenIds(new Set());
      }
    })();
    return () => {
      mounted = false;
    };
  }, [SEEN_KEY]);

  const markSeen = async (id: string) => {
    setSeenIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      AsyncStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(next))).catch(() => {});
      return next;
    });
    setTimeout(() => DeviceEventEmitter.emit("sessions-seen-updated"), 50);
  };

  // Fetch (unchanged)
  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getSessionListFromFirestore();
      setSessionLists(list);
      DeviceEventEmitter.emit("sessions-seen-updated");
    } catch (err) {
      Alert.alert("Fetch Error", "Could not load sessions from the database.");
      console.error("Session fetch error", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.email !== "Guest") fetchSessions();
    else setSessionLists([]);
  }, [fetchSessions, user?.email]);

  // Formatters (unchanged)
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  // Reset (unchanged)
  const publishReset = () => {
    setAddSessions(false);
    setTitle("");
    setDescription("");
    setLocation("");
    setDate(new Date());
    setTime(new Date());
  };

  // Publish (unchanged)
  const successfulPublish = async () => {
    const createdByEmail = user?.email ?? "Admin";
    try {
      const combined = new Date(date);
      combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
      const startMillis = combined.getTime();

      const sessionData: Omit<Session, "docId" | "timestamp"> = {
        title,
        description: description !== "" ? description : "No description provided",
        date: fmt(date),
        time: fmtTime(time),
        location,
        createdBy: createdByEmail,
        startMillis,
      };

      await addSessionToFirestore(sessionData);
      await fetchSessions();
      DeviceEventEmitter.emit("sessions-seen-updated");
      setTimeout(() => {
        Alert.alert("Success", "Session published successfully!");
      }, 250);
    } catch (error) {
      Alert.alert("Error", "There was an error publishing the session. Please try again.");
      console.error(error);
      return;
    }
  };

  // Edit / Delete (unchanged)
  const handleEditButton = (session: Session) => {
    setDescription(session.description === "No description provided" ? "" : session.description);
    setIsEditing(true);
    setSelectedSession(session);
    setAddSessions(true);
    setTitle(session.title);
    setLocation(session.location);
    const dt = new Date(session.startMillis);
    setDate(dt);
    setTime(dt);
  };

  const handleDeleteButton = (session: Session) => {
    const id = session.docId;
    if (!id) {
      Alert.alert("Error", "Missing session id.");
      return;
    }
    Alert.alert("Delete", "Are you sure you want to delete this session?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSession(id);
            setSelectedSession(null);
            await fetchSessions();
            DeviceEventEmitter.emit("sessions-seen-updated");
          } catch (e) {
            console.log(e);
          }
        },
      },
    ]);
  };

  // Publish entry points (unchanged)
  const handlePublish = () => {
    if (description.length === 0) {
      Alert.alert(
        "Are you sure?",
        "You have not added any description for this session. Do you wish to continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: async () => {
              await successfulPublish();
              publishReset();
            },
          },
        ]
      );
    } else {
      publishReset();
      successfulPublish();
    }
  };

  const handleRePublish = async () => {
    const createdByEmail = user?.email ?? "Admin";
    try {
      const combined = new Date(date);
      combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
      const startMillis = combined.getTime();

      const sessionData: Omit<Session, "docId" | "timestamp"> = {
        title,
        description: description !== "" ? description : "No description provided",
        date: fmt(date),
        time: fmtTime(time),
        location,
        createdBy: createdByEmail,
        startMillis,
      };

      if (!selectedSession || !selectedSession.docId) {
        Alert.alert("Error", "Missing session id.");
        return;
      }
      await editSession(selectedSession.docId, sessionData);
      await fetchSessions();
      setIsEditing(false);
      publishReset();
      setSelectedSession(null);
      setAddSessions(false);
    } catch (e) {
      console.error(e);
    }
  };

  const isFuture = (s: Session) => s.startMillis > Date.now();

  return {
    user,
    addSessions,
    setAddSessions,
    title,
    setTitle,
    description,
    setDescription,
    date,
    setDate,
    time,
    setTime,
    location,
    setLocation,
    sessionLists,
    selectedSession,
    setSelectedSession,
    isLoading,
    isEditing,
    setIsEditing,
    seenIds,
    markSeen,
    fetchSessions,
    fmt,
    fmtTime,
    publishReset,
    handlePublish,
    handleRePublish,
    handleEditButton,
    handleDeleteButton,
    isFuture,
  };
}
