import { useCallback, useEffect, useState } from "react";
import { Alert, DeviceEventEmitter } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { addSessionToFirestore, deleteSession, editSession, getSessionListFromFirestore } from "@/src/firestore_controller";
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

  /** MARK SEEN */
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
    return () => { mounted = false };
  }, [SEEN_KEY]);

  const markSeen = async (id: string) => {
    setSeenIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      AsyncStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(next))).catch(() => {});
      return next;
    });
    setTimeout(() => DeviceEventEmitter.emit("sessions-seen-updated"), 50);
  };

  /** FETCH SESSIONS */
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

  /** DATE FORMATTERS */
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  /** PICKERS */
  const openAndroidDate = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: (_, selected) => setDate(selected || date),
      mode: "date",
    });
  };
  const openAndroidTime = () => {
    DateTimePickerAndroid.open({
      value: time,
      onChange: (_, selected) => setTime(selected || time),
      mode: "time",
      display: "clock",
      is24Hour: false,
    });
  };

  /** CRUD ACTIONS */
  const publishReset = () => {
    setAddSessions(false);
    setTitle("");
    setDescription("");
    setLocation("");
    setDate(new Date());
    setTime(new Date());
  };

  const successfulPublish = async () => {
    const createdByEmail = user?.email ?? "Admin";
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
    try {
      await addSessionToFirestore(sessionData);
      await fetchSessions();
      DeviceEventEmitter.emit("sessions-seen-updated");
      Alert.alert("Success", "Session published successfully!");
    } catch (error) {
      Alert.alert("Error", "There was an error publishing the session.");
      console.error(error);
    }
  };

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
    if (!session.docId) {
      Alert.alert("Error", "Missing session id.");
      return;
    }
    Alert.alert("Delete", "Are you sure?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          await deleteSession(session.docId!);
          setSelectedSession(null);
          await fetchSessions();
          DeviceEventEmitter.emit("sessions-seen-updated");
        },
      },
    ]);
  };

  const handlePublish = () => {
    if (description.length === 0) {
      Alert.alert("Are you sure?", "No description added.", [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", onPress: async () => { await successfulPublish(); publishReset(); } },
      ]);
    } else {
      publishReset();
      successfulPublish();
    }
  };

  const handleRePublish = async () => {
    if (!selectedSession?.docId) {
      Alert.alert("Error", "Missing session id.");
      return;
    }
    const createdByEmail = user?.email ?? "Admin";
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
    await editSession(selectedSession.docId, sessionData);
    await fetchSessions();
    setIsEditing(false);
    publishReset();
    setSelectedSession(null);
    setAddSessions(false);
  };

  const isFuture = (s: Session) => s.startMillis > Date.now();

  return {
    user,
    addSessions, setAddSessions,
    title, setTitle,
    description, setDescription,
    date, setDate,
    time, setTime,
    location, setLocation,
    sessionLists,
    selectedSession, setSelectedSession,
    isLoading,
    isEditing, setIsEditing,
    seenIds, markSeen,
    fetchSessions,
    fmt, fmtTime,
    openAndroidDate, openAndroidTime,
    publishReset,
    handlePublish,
    handleRePublish,
    handleEditButton,
    handleDeleteButton,
    isFuture,
  };
}
