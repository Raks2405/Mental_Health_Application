import { Redirect, useGlobalSearchParams } from "expo-router";

export default function TabsIndex() {
  const params = useGlobalSearchParams();
  return <Redirect href={{ pathname: "/(tabs)/home", params }} />;
}
