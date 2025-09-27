// app/(tabs)/index.tsx
import { Redirect, useGlobalSearchParams } from "expo-router";

export default function TabsIndex() {
  const params = useGlobalSearchParams();               // { email: "..." }
  return <Redirect href={{ pathname: "/(tabs)/home", params }} />;
}
