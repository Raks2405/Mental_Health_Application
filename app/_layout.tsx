import ErrorBoundary from "@/src/components/ErrorBoundary";
import { UserProvider } from "@/src/context/UserContext";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-native-paper";

export default function RootLayout() {
  return (
    <Provider>
    <ErrorBoundary>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 2 }} edges={[ 'left', 'right']}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <UserProvider>

              <Stack>
                <Stack.Screen name='(auth)' options={{ headerShown: false }} />
                <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
              </Stack>
            </UserProvider>
          </GestureHandlerRootView>
        </SafeAreaView>
      </SafeAreaProvider>
    </ErrorBoundary>
    </Provider>
  )
}
