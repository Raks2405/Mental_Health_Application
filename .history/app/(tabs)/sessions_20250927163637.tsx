import { useUser } from "@/src/UserContext";
import LottieView from 'lottie-react-native';
import React, { useState } from "react";
import { KeyboardAvoidingView, Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { FAB, Provider } from "react-native-paper";
import lock from '../../assets/animations/locked_icon.json';


export default function Sessions() {
    const { user } = useUser();
    const [addSessions, setAddSessions] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");

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
                            style={{ position: "absolute", alignSelf: 'flex-end', bottom: 30, right: 20 , backgroundColor: '#003d53ff' }}
                            onPress={() => {
                                setAddSessions(true);
                            }}
                        />
                        <Modal visible = {addSessions} transparent animationType="fade" onRequestClose={() => setAddSessions(false)}></Modal>
                           <KeyboardAvoidingView>
                               <TextInput placeholder="Session Title" style={styles.sessionTitle} value={title} onChangeText={setTitle}/>
                               <TextInput placeholder="Description" style={styles.sessionTitle} value={description} onChangeText={setDescription}/>
                                <TextInput placeholder="Date" style={styles.sessionTitle} value={date} onChangeText={setDate}/>
                                 <TextInput placeholder="Time" style={styles.sessionTitle} value={time} onChangeText={setTime}/>
                                  <TextInput placeholder="Location" style={styles.sessionTitle} value={location} onChangeText={setLocation}/>

                           </KeyboardAvoidingView>
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
    }

});



