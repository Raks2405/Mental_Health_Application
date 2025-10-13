import { StyleSheet, Text, View } from "react-native";
import { Slot } from "expo-router";

export default function ProductsLayout() {
    return(
        <View style={styles.container}>
           <Slot/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
});