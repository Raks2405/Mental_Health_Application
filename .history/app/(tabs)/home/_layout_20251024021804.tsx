import ThemeBackground from "@/src/shared/ThemeBackground";
import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";

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