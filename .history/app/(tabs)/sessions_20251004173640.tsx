import { addSessionToFirestore, getSessionListFromFirestore } from "@/src/firestore_controller";
import { Session } from "@/src/Session";
import { useUser } from "@/src/UserContext";
import DateTimePickerIOS, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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
        successfulPublish();
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
                    },
                }

            ])
        } else {
            publishReset();
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
                                <Pressable style={{ flexDirection: 'row', alignContent: 'space-between' }} onPress={() => setSelectedSession(item)}>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: 'black', margin: 10 }}>
                                        {item.title}
                                    </Text>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: future ? 'green' : 'red' , alignContent: 'flex-end'}}>
                                        {future ? 'Upcoming' : 'Expired'}
                                    </Text>
                                    <FontAwesome name='arrows-v' size={20} color={'gray'} />
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
                            <Text style={{ fontWeight: '700', fontSize: 18 }}>{selectedSession?.title}</Text>
                            <Text>{selectedSession?.date}</Text>
                            <Text>{selectedSession?.time}</Text>
                            <Text>{selectedSession?.location}</Text>
                            <Text style={{ marginTop: 8 }}>{selectedSession?.description}</Text>
                        </View>
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

                                        <Text style={{ fontWeight: 'bold', fontSize: 24, marginBottom: 12 }}>Add Session</Text>
                                        <TextInput placeholder="Session Title" style={styles.sessionTitle} value={title} onChangeText={setTitle} />

                                        {Platform.OS === 'ios' ? (
                                            <>
                                                <Text style={{ marginBottom: 6, fontWeight: '600' }}>Date</Text>
                                                <DateTimePickerIOS
                                                    value={date}
                                                    mode='date'
                                                    display="default"
                                                    onChange={(event, selectedDate) => {
                                                        const currentDate = selectedDate || date;
                                                        setDate(currentDate);
                                                    }}
                                                    style={{ width: '100%', marginBottom: 10 }}
                                                />
                                                <Text style={{ marginBottom: 6, fontWeight: '600' }}>Time</Text>
                                                <DateTimePickerIOS
                                                    value={time}
                                                    mode='time'
                                                    display="default"
                                                    is24Hour={true}
                                                    onChange={(event, selectedTime) => {
                                                        const currentTime = selectedTime || time;
                                                        setTime(currentTime);
                                                    }}
                                                    style={{ width: '100%', marginBottom: 10 }}
                                                />

                                            </>
                                        ) : (
                                            <>
                                                <Text style={{ marginBottom: 6, fontWeight: '600' }}>Date</Text>
                                                <Pressable
                                                    onPress={() => openAndroidDate()}
                                                    style={styles.androidDate}>

                                                    <Text>{fmt(date)}</Text>
                                                </Pressable>

                                                <Text style={{ marginBottom: 6, fontWeight: '600' }}>Time</Text>
                                                <Pressable
                                                    onPress={() => openAndroidTime()}
                                                    style={styles.androidDate}>

                                                    <Text>{fmtTime(time)}</Text>
                                                </Pressable>
                                            </>
                                        )
                                        }
                                        <TextInput placeholder="Location" style={styles.sessionTitle} value={location} onChangeText={setLocation} />
                                        <TextInput placeholder="Description" style={styles.adminSessionDescription} multiline numberOfLines={12} value={description} onChangeText={setDescription} />
                                    </ScrollView>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                                        <Pressable onPress={() => {
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
                                        }} style={[styles.btn, styles.btnOutline]}>
                                            <Text>Cancel</Text>
                                        </Pressable>
                                        <View style={{ width: 12 }} />
                                        <Pressable disabled={
                                            title.length === 0 || location.length === 0 || time == null || date == null ? true : false
                                        } onPress={handlePublish} style={title.length === 0 || location.length === 0 || time == null || date == null ? [styles.btn, styles.btnOutline] : [styles.btn]}>
                                            <Text style={{ color: '#fff' }}>Publish</Text>
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
        <View style={styles.container}>
            <Text>{SessionListContent()}</Text>
            <Text>Sessions Screen</Text>
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
        borderColor: '#ddd',
        borderRadius: 3,
        padding: 10,
        marginBottom: 10,
    },
    btn: {
        backgroundColor: '#0a84ff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8
    },
    btnOutline: {
        backgroundColor: '#eee'
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    modalCard: {
        width: '88%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 6
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    androidDate: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
    },
    adminSessionDescription: {
        height: 250,                 // make it big
        borderWidth: 1,
        borderColor: '#ddd',
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

});




