import { useUser } from "@/src/UserContext";
import DateTimePickerIOS, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import LottieView from 'lottie-react-native';
import React, { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { FAB, Provider } from "react-native-paper";
import lock from '../../assets/animations/locked_icon.json';


export default function Sessions() {
    const { user } = useUser();
    const [addSessions, setAddSessions] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [location, setLocation] = useState("");
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
            display: 'default',
            is24Hour: true,
        });
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
            <View style={styles.container}>
                <Provider>
                    <View style={{ flex: 1, }}>
                        {/* content here */}
                        <FAB
                            //text instead of icon
                            label="Add Session"
                            style={{ position: "absolute", alignSelf: 'flex-end', bottom: 30, right: 20, backgroundColor: '#003d53ff' }}
                            onPress={() => {
                                setAddSessions(true);
                            }}
                        />
                        <Modal visible={addSessions} transparent animationType="fade" onRequestClose={() => setAddSessions(false)}>
                            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.centered}>
                                <Pressable style={styles.backdrop} onPress={() => setAddSessions(false)} />
                                <View style={styles.modalCard}>
                                    <TextInput placeholder="Session Title" style={styles.sessionTitle} value={title} onChangeText={setTitle} />
                                    <TextInput placeholder="Description" style={styles.sessionTitle} value={description} onChangeText={setDescription} />
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
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                        <Pressable onPress={() => setAddSessions(false)} style={[styles.btn, styles.btnOutline]}>
                                            <Text>Cancel</Text>
                                        </Pressable>
                                        <View style={{ width: 12 }} />
                                        <Pressable onPress={null} style={styles.btn}>
                                            <Text style={{ color: '#fff' }}>Publish</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </KeyboardAvoidingView>
                        </Modal>
                    </View>
                </Provider>

            </View>
            //floating button to add session
            //list of sessions with edit and delete options
            //option to view session details


        );
    }
    return (
        <View style={styles.container}>
            <Text>Sessions Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    }

});



