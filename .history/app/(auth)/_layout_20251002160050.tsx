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
