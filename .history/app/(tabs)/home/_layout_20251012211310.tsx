import { StyleSheet, Text, View } from "react-native";
import { Slot } from "expo-router";
import ThemeBackground from "@/app/components/ThemeBackground";

export default function ProductsLayout() {
    return (
        <ThemeBackground>
            <View style={styles.container}>
                <Slot />
            </View>
        </ThemeBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

});