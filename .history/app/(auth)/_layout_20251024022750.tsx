import { Slot, Stack } from "expo-router";

import {View, Text, StyleSheet, SafeAreaView} from 'react-native'

export default function RootLayout() {
return(
  
  <View style = {styles.container}>
     <Slot/>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
