import { Stack } from "expo-router";
import { UserProvider } from "../src/UserContext";

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack>
        <Stack.Screen name='(auth)' options={{ headerShown: false }} />
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      </Stack>
    </UserProvider>
  );
}
