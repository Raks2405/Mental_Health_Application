import { router, Stack } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import wave from '../assets/animations/Waving.json';

export default function Goodbye() {
  useEffect(() => {
    const t = setTimeout(() => router.replace('/(auth)/loginpage'), 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={s.root}>
      <LottieView
        source={wave}
        autoPlay loop={false}
        style={{ width: 280, height: 280 }} />
      <Text style={s.text}>See you again 👋!</Text>
    </View>
    </>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  text: { marginTop: 12, fontSize: 20, fontWeight: '600' },
});
