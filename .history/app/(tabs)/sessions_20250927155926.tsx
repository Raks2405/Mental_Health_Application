import { useUser } from "@/src/UserContext";
import LottieView from 'lottie-react-native';
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FAB, Provider } from "react-native-paper";
import lock from '../../assets/animations/locked_icon.json';

export default function Sessions() {
    const { user } = useUser();
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
                            icon="plus"
                            style={{ position: "absolute", justifyContent: 'flex-end',alignSelf: 'flex-end',  bottom: 20 , backgroundColor: '#003d53ff' }}
                            onPress={() => console.log("FAB pressed")}
                        />
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        marginTop: 12,
        fontSize: 20,
        fontWeight: '600'
    },

});



