import { Slot, Stack } from "expo-router";

import {View, Text, StyleSheet, SafeAreaView} from 'react-native'

export default function RootLayout() {
return(
  
  <SafeAreaView style = {styles.container}>
     <Slot/>
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'red',
    padding: 20,
  },
  headerText: {
    color: 'white',
  },
  footer: {
    backgroundColor: 'blue',
    padding: 20,
  },
  footerText: {
    color: 'white'
  },
})
