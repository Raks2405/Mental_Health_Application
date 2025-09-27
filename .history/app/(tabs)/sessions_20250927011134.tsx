import { StyleSheet, Text, View } from "react-native";
import React from "react";
import LottieView from 'lottie-react-native';
import lock from '../../assets/animations/locked_icon.json'
import { useLocalSearchParams } from "expo-router";

export default function Sessions() {

    const { email } = useLocalSearchParams<{email: string}>();
    if (email === 'Guest') {
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



