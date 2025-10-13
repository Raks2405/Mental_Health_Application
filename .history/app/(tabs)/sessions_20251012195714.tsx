import { addSessionToFirestore, deleteSession, editSession, getSessionListFromFirestore } from "@/src/firestore_controller";
import { Session } from "@/src/Session";
import { useUser } from "@/src/UserContext";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerIOS, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from "expo-router";
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useState } from "react";
import { Alert, DeviceEventEmitter, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { FAB, Provider } from "react-native-paper";
import lock from '../../assets/animations/locked_icon.json';




export default function Sessionsssss() {
    const { user } = useUser();
    const navigation = useNavigation();
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
    const userKey = user?.email ?? 'anon';
    const SEEN_KEY = `Sessions_seen_${userKey}`;

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(SEEN_KEY);
                if (!isMounted) return;
                setSeenIds(raw ? new Set(JSON.parse(raw)) : new Set());
            } catch {
                if (isMounted) setSeenIds(new Set());
            }
        })();
        return () => { isMounted = false; };
    }, [SEEN_KEY]);

    const markSeen = async (id: string) => {
        setSeenIds(prev => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            AsyncStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(next))).catch(() => { });
            return next;
        });
        setTimeout(() => {
            DeviceEventEmitter.emit('sessions-seen-updated');
        }, 50);
    };



    const fetchSessions = useCallback(async () => { //caching
        setIsLoading(true);
        try {
            const list = await getSessionListFromFirestore();
            setSessionLists(list);
            DeviceEventEmitter.emit('sessions-seen-updated');
        } catch (err) {
            Alert.alert("Fetch Error", "Could not load sessions from the database.");
            console.error("Session fetch error", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user && user.email !== 'Guest') {
            fetchSessions();
        }
        else {
            setSessionLists([]);
        }

    }, [fetchSessions, user?.email]);



    const fmt = (d: Date) =>
        d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const fmtTime = (d: Date) =>
        d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    const openAndroidDate = () => {
        DateTimePickerAndroid.open({
            value: date,
            onChange: (event, selectedDate) => {
                const currentDate = selectedDate || date;
                setDate(currentDate);
            },
            mode: 'date',
            display: 'default',
        });
    }

    const openAndroidTime = () => {
        DateTimePickerAndroid.open({
            value: time,
            onChange: (event, selectedTime) => {
                const currentTime = selectedTime || time;
                setTime(currentTime);
            },
            mode: 'time',
            display: 'clock',
            is24Hour: false,
        });
    }


    const successfulPublish = async () => {
        const createdByEmail = user?.email ?? 'Admin';
        try {
            const combined = new Date(date);
            combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
            const startMillis = combined.getTime();
            const sessionData: Omit<Session, 'docId' | 'timestamp'> = {
                title: title,
                description: description !== "" ? description : "No description provided",
                date: fmt(date),
                time: fmtTime(time),
                location: location,
                createdBy: createdByEmail,
                startMillis,
            };
            await addSessionToFirestore(sessionData);
            await fetchSessions();
            DeviceEventEmitter.emit('sessions-seen-updated');
            setTimeout(() => {
                Alert.alert("Success", "Session published successfully!");
            }, 250);

        } catch (error) {
            Alert.alert("Error", "There was an error publishing the session. Please try again.");
            console.log(error)
            return;
        }

    }

    const handleEditButton = (session: Session) => {
        setIsEditing(true);
        setSelectedSession(session);
        setAddSessions(true);

        setTitle(session.title);
        setLocation(session.location);
        setDescription(session.description);

        const dt = new Date(session.startMillis);
        setDate(dt);
        setTime(dt);


    }

    const handleDeleteButton = (session: Session) => {
        const id = session.docId;
        if (!id) {
            Alert.alert("Error", "Missing session id.");
            return;
        }

        Alert.alert('Delete', 'Are you sure you want to delete this session?', [{
            text: 'No',
            style: 'cancel'
        },
        {
            text: 'Yes',
            style: 'destructive',
            onPress: async () => {
                try {
                    await deleteSession(id);
                    setSelectedSession(null);
                    await fetchSessions();
                    DeviceEventEmitter.emit('sessions-seen-updated');
                } catch (e) {
                    console.log(e)
                }

            }
        }])
    }


    const publishReset = () => {
        setAddSessions(false);
        setTitle("");
        setDescription("");
        setLocation("");
        setDate(new Date());
        setTime(new Date());
    }

    const handlePublish = () => {
        if (description.length === 0) {
            Alert.alert("Are you sure?", "You have not added any description for this session. Do you wish to continue?", [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Continue",
                    onPress: () => {
                        publishReset();
                        successfulPublish();
                    },
                }

            ])
        } else {
            publishReset();
            successfulPublish();
        }

    }

    const handleRePublish = async () => {
        const createdByEmail = user?.email ?? 'Admin';

        try {
            const combined = new Date(date);
            combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
            const startMillis = combined.getTime();
            const sessionData: Omit<Session, 'docId' | 'timestamp'> = {
                title: title,
                description: description !== "" ? description : "No description provided",
                date: fmt(date),
                time: fmtTime(time),
                location: location,
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
    }
    const isFuture = (s: Session) => (s.startMillis) > Date.now();


    const SessionListContent = () => {
        if (isLoading) {
            return (
                <View style={styles.container}>
                    <Text>Loading sessions...</Text>
                </View>
            );
        }

        if (sessionLists?.length === 0) {
            return (
                <View style={styles.container}>
                    <Text>No sessions added. Please come back later</Text>
                </View>
            )
        }

        return (
            <>
                <FlatList
                    data={sessionLists}
                    keyExtractor={(item, idx) => item.docId ?? `${item.title}-${item.date}-${idx}`}
                    renderItem={({ item }) => {
                        const future = isFuture(item);
                        return (
                            <LinearGradient colors={['#2c979fff', '#57b1cfff', '#e7e7e7ff']}  // tweak as you like
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.subCard}>
                                <Pressable
                                    style={styles.row}
                                    onPress={() => {
                                        setSelectedSession(item);
                                        if (item.docId) markSeen(item.docId);
                                    }}
                                >
                                    <Text style={styles.title}>{item.title}</Text>
                                    {!item.docId || !seenIds.has(item.docId) ? (
                                        <View style={styles.newBadge}>
                                            <Text style={styles.newBadgeText}>NEW</Text>
                                        </View>
                                    ) : null}


                                    {/* bottom-right status */}
                                    <Text
                                        style={[
                                            styles.status,
                                            future ? styles.statusUpcoming : styles.statusExpired,
                                        ]}
                                    >
                                        {future ? 'Upcoming' : 'Expired'}
                                    </Text>
                                </Pressable>
                            </LinearGradient>
                        );
                    }}

                />
                <Modal
                    visible={!!selectedSession}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setSelectedSession(null)}
                >
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} style={styles.centered}>
                        <Pressable style={styles.backdrop} onPress={() => setSelectedSession(null)} />
                        <LinearGradient
                            colors={['#2372a7ff', '#168895ff', '#032527ff']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.modalCardGradient}
                        >
                            {/* glow highlight */}
                            <LinearGradient
                                colors={['rgba(255, 255, 255, 0.36)', 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0.8, y: 0.2 }}
                                style={styles.modalGlow}
                            />

                            {/* glass card */}
                            <LinearGradient
                                colors={['rgba(0, 125, 160, 0.18)', 'rgba(0, 125, 160, 0.18)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.modalCardGlass}
                            >
                                {user?.email === 'Admin' ? (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Pressable
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    backgroundColor: 'rgba(30, 64, 175, 0.9)',
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 6,
                                                    borderRadius: 10
                                                }}
                                                onPress={() => {
                                                    if (selectedSession) {
                                                        handleEditButton(selectedSession);
                                                    }
                                                }}
                                            >
                                                <FontAwesome name='edit' size={14} color='white' style={{ marginRight: 6 }} />
                                                <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'white' }}>Edit</Text>
                                            </Pressable>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Pressable
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    backgroundColor: 'rgba(185, 28, 28, 0.95)',
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 6,
                                                    borderRadius: 10
                                                }}
                                                onPress={() => {
                                                    if (selectedSession) {
                                                        handleDeleteButton(selectedSession);
                                                    }
                                                }}
                                            >
                                                <FontAwesome name='trash' size={14} color='white' style={{ marginRight: 6 }} />
                                                <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'white' }}>Delete</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                ) : null}

                                <ScrollView automaticallyAdjustKeyboardInsets>
                                    {/* Title */}
                                    <View style={styles.modalHeaderRow}>
                                        <Text style={styles.modalTitle} numberOfLines={2}>
                                            {selectedSession?.title}
                                        </Text>
                                    </View>

                                    {/* Meta chips */}
                                    <View style={styles.chipsRow}>
                                        <View style={styles.chip}>
                                            <FontAwesome name="calendar" size={12} color="#0ea5e9" />
                                            <Text style={styles.chipText}>{selectedSession?.date}</Text>
                                        </View>
                                        <View style={styles.chip}>
                                            <FontAwesome name="clock-o" size={12} color="#0ea5e9" />
                                            <Text style={styles.chipText}>{selectedSession?.time}</Text>
                                        </View>
                                    </View>

                                    {/* Location */}
                                    <View style={styles.rowBlock}>
                                        <View style={styles.rowIconWrap}>
                                            <FontAwesome name="map-marker" size={16} color="#93c5fd" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.rowLabel}>Location</Text>
                                            <Text style={styles.rowValue} numberOfLines={3}>
                                                {selectedSession?.location}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Divider */}
                                    <View style={styles.divider} />

                                    {/* Description */}
                                    <View style={styles.descBlock}>
                                        <View style={styles.descHeader}>
                                            <FontAwesome name="align-left" size={12} color="#a5b4fc" />
                                            <Text style={styles.descTitle}>Description</Text>
                                        </View>
                                        <Text style={styles.descText}>
                                            {selectedSession?.description}
                                        </Text>
                                    </View>
                                </ScrollView>

                            </LinearGradient>
                        </LinearGradient>

                    </KeyboardAvoidingView>
                </Modal>
            </>
        );
    }


    if (user?.email === 'Guest') {
        return (
            <View style={styles.container}>
                <LottieView
                    source={lock}
                    autoPlay
                    style={{ width: 280, height: 280 }} />
                <Text style={styles.text}>Please login to access Sessions</Text>
            </View>
        );
    }
    if (user?.email === 'Admin') {
        return (
            <View style={{ flex: 1 }}>
                {SessionListContent()}
                <Provider>
                    <View style={{ flex: 1, }}>
                        {/* content here */}
                        <FAB
                            //text instead of icon
                            icon={"plus"}
                            style={{ position: "absolute", alignSelf: 'flex-end', bottom: 30, right: 20, backgroundColor: '#003d53ff' }}
                            onPress={() => {
                                setAddSessions(true);
                            }}
                        />
                        <Modal visible={addSessions} transparent animationType="fade" onRequestClose={() => setAddSessions(false)}>
                            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} style={styles.centered}>

                                <Pressable style={styles.backdrop} onPress={() => setAddSessions(false)} />
                                <View style={styles.modalCard}>
                                    <ScrollView
                                        automaticallyAdjustKeyboardInsets>

                                        <Text style={{ fontWeight: 'bold', fontSize: 24, marginBottom: 12, textAlign: 'center' }}>{isEditing ? "Edit Session" : "Add Session"}</Text>
                                        <TextInput placeholder="Session Title" style={[styles.sessionTitle, { backgroundColor: 'white' }]} value={title} onChangeText={setTitle} />

                                        {Platform.OS === 'ios' ? (
                                            <>
                                                <Text style={{ marginBottom: 6, fontWeight: '600' }}> Select Date</Text>
                                                <DateTimePickerIOS
                                                    value={date}
                                                    mode='date'
                                                    display="default"
                                                    onChange={(event, selectedDate) => {
                                                        const currentDate = selectedDate || date;
                                                        setDate(currentDate);
                                                    }}
                                                    style={{ width: '100%', marginBottom: 10, borderColor: '#000000ff', backgroundColor: 'white' }}
                                                />
                                                <Text style={{ marginBottom: 6, fontWeight: '600' }}>Select Time</Text>
                                                <DateTimePickerIOS
                                                    value={time}
                                                    mode='time'
                                                    display='clock'
                                                    is24Hour={false}
                                                    onChange={(event, selectedTime) => {
                                                        const currentTime = selectedTime || time;
                                                        setTime(currentTime);
                                                    }}
                                                    style={{ width: '100%', marginBottom: 10, borderColor: '#000000ff', backgroundColor: 'white' }}
                                                />

                                            </>
                                        ) : (
                                            <>
                                                <Text style={{ marginBottom: 6, fontWeight: '600' }}>Select Date</Text>
                                                <Pressable
                                                    onPress={() => openAndroidDate()}
                                                    style={[styles.androidDate, { backgroundColor: 'white' }]}>

                                                    <Text>{fmt(date)}</Text>
                                                </Pressable>

                                                <Text style={{ marginBottom: 6, fontWeight: '600' }}>Select Time</Text>
                                                <Pressable
                                                    onPress={() => openAndroidTime()}
                                                    style={[styles.androidDate, { backgroundColor: 'white' }]}>

                                                    <Text>{fmtTime(time)}</Text>
                                                </Pressable>
                                            </>
                                        )
                                        }
                                        <TextInput placeholder="Location" style={[styles.sessionTitle, { backgroundColor: 'white' }]} value={location} onChangeText={setLocation} />
                                        <TextInput placeholder="Description" style={[styles.adminSessionDescription, { backgroundColor: 'white' }]} multiline numberOfLines={12} value={description} onChangeText={setDescription} />
                                    </ScrollView>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>

                                        {isEditing ? (<Pressable onPress={() => {
                                            Alert.alert("Cancel", "Are you sure you want to cancel your changes?", [
                                                {
                                                    text: "No",
                                                    style: "cancel"
                                                },
                                                {
                                                    text: "Yes",
                                                    onPress: () => {
                                                        setAddSessions(false);
                                                    },
                                                    style: 'destructive'
                                                }
                                            ])
                                        }} style={({ pressed }) => [
                                            [styles.btn],
                                            pressed && styles.loginBtnPressed,
                                        ]}>
                                            <Text style={{ color: '#fff' }}>Cancel</Text>
                                        </Pressable>) : ((<Pressable onPress={() => {
                                            Alert.alert("Save changes?", "Do you want to save your changes?", [
                                                {
                                                    text: "No",
                                                    onPress: () => {
                                                        publishReset();

                                                    }
                                                },
                                                {
                                                    text: "Yes",
                                                    onPress: () => {
                                                        setAddSessions(false);
                                                    }
                                                }
                                            ])
                                        }} style={({ pressed }) => [
                                            [styles.btn],
                                            pressed && styles.loginBtnPressed,
                                        ]}>
                                            <Text style={{ color: '#fff' }}>Cancel</Text>
                                        </Pressable>))}


                                        <View style={{ width: 12 }} />
                                        <Pressable disabled={
                                            title.length === 0 || location.length === 0 || time == null || date == null ? true : false
                                        } onPress={isEditing ? handleRePublish : handlePublish}
                                            android_ripple={{ color: "rgba(255,255,255,0.2)" }}   // Android ripple
                                            style={({ pressed }) => [
                                                title.length === 0 || location.length === 0 || time == null || date == null ? [styles.btn, styles.loginBtnPressed] : [styles.btn],
                                                styles.btn,
                                                pressed && styles.loginBtnPressed,                   // iOS/Android feedback
                                            ]}>
                                            <Text style={{ color: '#ffffffff' }}>{isEditing ? "Re-Publish" : "Publish"}</Text>
                                        </Pressable>
                                    </View>

                                </View>
                            </KeyboardAvoidingView>
                        </Modal>
                    </View>
                </Provider>

            </View>
        );
    }
    return (
        <View style={{ flex: 1 }}>
            {SessionListContent()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        marginTop: 12,
        fontSize: 20,
        fontWeight: '600'
    },
    sessionTitle: {
        borderWidth: 1,
        borderColor: '#000000ff',
        borderRadius: 3,
        padding: 10,
        marginBottom: 10,
    },
    btn: {
        backgroundColor: '#003d53ff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8
    },
    btnOutline: {
        backgroundColor: '#ffffffff'
    },
    disabledbtn: {
        backgroundColor: '#656565ff'
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)'
    },

    modalCard: {
        width: '88%',
        backgroundColor: '#93bdd7ff',
        borderRadius: 12,
        borderWidth: 3,
        padding: 16,
        ...Platform.select(
            {
                ios:
                {
                    shadowOffset:
                    {
                        width: 2,
                        height: 2
                    },
                    shadowColor: '#000000ff',
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                },
                android: {
                    elevation: 6
                }
            })
    },
    loginBtn: {
        backgroundColor: "#003d53ff",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    loginBtnPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    androidDate: {
        borderWidth: 1,
        borderColor: '#000000ff',
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
    },
    adminSessionDescription: {
        height: 250,                 // make it big
        borderWidth: 1,
        borderColor: '#000000ff',
        borderRadius: 8,
        padding: 12,
        textAlignVertical: 'top',
    },
    subCard: {
        // backgroundColor: 'rgba(122, 180, 205, 1)',  // ← remove this
        paddingTop: 5,
        paddingBottom: 5,
        paddingStart: 1,
        paddingEnd: 1,

        marginTop: 10,
        marginBottom: 2,
        marginStart: 2,
        marginEnd: 2,

        alignSelf: 'stretch',
        borderWidth: 1,
        borderRadius: 12,                // a bit rounder looks nicer
        borderColor: 'black',
        overflow: 'hidden',              // so gradient respects radius

        justifyContent: 'space-between',
        ...Platform.select({
            ios: {
                shadowOffset: { width: 2, height: 2 },
                shadowColor: '#000',
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            }
        })
    },

    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 10,
        position: 'relative', // <-- enables absolute child
    },

    newBadge: {
        position: 'absolute',
        right: 10,
        top: 1,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        backgroundColor: 'red',
    },
    newBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
    },

    title: {
        fontSize: 16,
        fontWeight: '500',
        color: 'black',
        marginRight: 8,
        maxWidth: '75%',
    },
    status: {
        position: 'absolute',
        right: 10,
        bottom: 3,
        fontSize: 12,
        fontWeight: '600',
    },
    meta: {
        fontSize: 14,
        color: 'black',
    },
    metaLabel: {
        fontWeight: 'bold',
    },
    statusUpcoming: { color: '#006613ff', fontWeight: 'bold' },
    statusExpired: { color: '#b50000ff', fontWeight: 'bold' },

    modalCardGradient: {
        width: '88%',
        borderRadius: 18,
        padding: 3, // gradient "frame"
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 8 },
                shadowColor: '#000',
                shadowOpacity: 0.35,
                shadowRadius: 16,
            },
            android: {
                elevation: 10,
            }
        })
    },

    modalGlow: {
        position: 'absolute',
        top: -40,
        left: -30,
        width: 220,
        height: 160,
        borderRadius: 100,
        opacity: 0.8,
    },

    modalCardGlass: {
        backgroundColor: 'rgba(0, 104, 108, 0.35)', // deep translucent slate
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.18)',
    },

    modalTitle: {
        fontWeight: '800',
        fontSize: 20,
        color: '#f8fafc',
        textAlign: 'center',
        letterSpacing: 0.3,
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 6,
    },

    metaLight: {
        fontSize: 14,
        color: '#e5e7eb',
        lineHeight: 20,
    },

    metaLabelLight: {
        fontWeight: '700',
        color: '#fafafa',
    },


});




