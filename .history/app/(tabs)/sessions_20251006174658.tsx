import { addSessionToFirestore, getSessionListFromFirestore } from "@/src/firestore_controller";
import { Session } from "@/src/Session";
import { useUser } from "@/src/UserContext";
import DateTimePickerIOS, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useState, useRef } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Easing, Animated } from "react-native";
import { FAB, Provider } from "react-native-paper";
import lock from '../../assets/animations/locked_icon.json';
import { FontAwesome } from "@expo/vector-icons";


export default function Sessionsssss() {
    const { user } = useUser();
    const [addSessions, setAddSessions] = useState(false);
    const [viewSessions, setViewSessions] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [location, setLocation] = useState("");
    const [sessionLists, setSessionLists] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current



    const fetchSessions = useCallback(async () => { //caching
        setIsLoading(true);
        try {
            const list = await getSessionListFromFirestore();
            setSessionLists(list);
        } catch (err) {
            Alert.alert("Fetch Error", "Could not load sessions from the database.");
            console.error("Session fetch error", err);
        } finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        if (selectedSession) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.ease),
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            slideAnim.setValue(30);
        }
    }, [selectedSession]);

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
            display: 'spinner',
            is24Hour: true,
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
            setTimeout(() => {
                Alert.alert("Success", "Session published successfully!");
            }, 250);

        } catch (error) {
            Alert.alert("Error", "There was an error publishing the session. Please try again.");
            console.log(error)
            return;
        }

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
                            <View style={styles.subCard}>
                                <Pressable
                                    style={styles.row}               // <- use relative positioning
                                    onPress={() => setSelectedSession(item)}
                                >
                                    <Text style={styles.title}>{item.title}</Text>


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
                            </View>
                        );
                    }}
                // if you want separators:
                // ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                />
                <Modal
                    visible={!!selectedSession}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setSelectedSession(null)}
                >
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} style={styles.centered}>
                        <Pressable style={styles.backdrop} onPress={() => setSelectedSession(null)} />
                        <View style={styles.modalCard}>
                            {user?.email === 'Admin' ? (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Pressable
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                backgroundColor: '#1f1fb0ff',
                                                paddingHorizontal: 10,
                                                paddingVertical: 6,
                                                borderRadius: 6
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
                                                backgroundColor: '#b01f1fff',
                                                paddingHorizontal: 10,
                                                paddingVertical: 6,
                                                borderRadius: 6
                                            }}
                                        >
                                            <FontAwesome name='trash' size={14} color='white' style={{ marginRight: 6 }} />
                                            <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'white' }}>Delete</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ) : null}
                            <View style={{ borderRadius: 1, padding: 5, alignItems: 'center' }}>
                                <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 12 }}>{selectedSession?.title}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ marginTop: 3 }}>
                                    <Text style={{ fontWeight: 'bold' }}>Date: </Text>
                                    {selectedSession?.date}
                                </Text>
                                <Text style={{ marginTop: 3 }}>
                                    <Text style={{ fontWeight: 'bold' }}>Location: </Text>
                                    {selectedSession?.location}
                                </Text>
                            </View>
                            <Text style={{ marginTop: 3 }}>
                                <Text style={{ fontWeight: 'bold' }}>Time: </Text>
                                {selectedSession?.time}
                            </Text>

                            <Text style={{ marginTop: 10 }}>
                                <Text style={{ fontWeight: 'bold' }}>Description: </Text>
                                {selectedSession?.description}
                            </Text>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </>
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
                        <Modal
                            visible={!!selectedSession}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setSelectedSession(null)}
                        >
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                                style={styles.centered}
                            >
                                <Pressable style={styles.backdrop} onPress={() => setSelectedSession(null)} />

                                <Animated.View
                                    style={[
                                        styles.modalCard,
                                        {
                                            opacity: fadeAnim,
                                            transform: [{ translateY: slideAnim }],
                                        },
                                    ]}
                                >
                                    {user?.email === 'Admin' && (
                                        <View style={styles.actionRow}>
                                            {/* Edit Button */}
                                            <Pressable
                                                android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                                                style={[styles.btnBase, { backgroundColor: '#1f1fb0ff' }]}
                                            >
                                                <FontAwesome name="edit" size={14} color="white" style={{ marginRight: 6 }} />
                                                <Text style={styles.btnText}>Edit</Text>
                                            </Pressable>

                                            {/* Delete Button */}
                                            <Pressable
                                                android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                                                style={[styles.btnBase, { backgroundColor: '#b01f1fff' }]}
                                            >
                                                <FontAwesome name="trash" size={14} color="white" style={{ marginRight: 6 }} />
                                                <Text style={styles.btnText}>Delete</Text>
                                            </Pressable>
                                        </View>
                                    )}

                                    {/* Title */}
                                    <View style={{ borderRadius: 1, padding: 5, alignItems: 'center' }}>
                                        <Text style={{ fontWeight: '700', fontSize: 20, marginBottom: 12, color: '#222' }}>
                                            {selectedSession?.title}
                                        </Text>
                                    </View>

                                    {/* Date & Location */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ marginTop: 3 }}>
                                            <Text style={{ fontWeight: 'bold' }}>Date: </Text>
                                            {selectedSession?.date}
                                        </Text>
                                        <Text style={{ marginTop: 3 }}>
                                            <Text style={{ fontWeight: 'bold' }}>Location: </Text>
                                            {selectedSession?.location}
                                        </Text>
                                    </View>

                                    {/* Time */}
                                    <Text style={{ marginTop: 3 }}>
                                        <Text style={{ fontWeight: 'bold' }}>Time: </Text>
                                        {selectedSession?.time}
                                    </Text>

                                    {/* Description */}
                                    <Text style={{ marginTop: 10, lineHeight: 20, color: '#444' }}>
                                        <Text style={{ fontWeight: 'bold' }}>Description: </Text>
                                        {selectedSession?.description}
                                    </Text>
                                </Animated.View>
                            </KeyboardAvoidingView>
                        </Modal>
                    </View>
                </Provider>

            </View>
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
        backgroundColor: 'rgba(178, 155, 155, 1)',

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
        borderRadius: 5,
        borderColor: 'white',

        justifyContent: 'space-between',
        ...Platform.select({

            ios: {
                shadowOffset: { width: 2, height: 2 },
                shadowColor: '#000000ff',
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
        bottom: 8,
        fontSize: 12,
        fontWeight: '600',
    },
    statusUpcoming: { color: 'green' },
    statusExpired: { color: 'red' },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalCard: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 18,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    btnBase: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        elevation: 2,
    },
    btnText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: 'white',
    },

});




