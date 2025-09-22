import { useEffect } from "react";
import { router } from "expo-router";
import { subscribeToAuth } from "../src/auth";

export default function Index() {
  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      if (user) router.replace("/(tabs)/home");
      else router.replace("/(auth)/loginpage");
    });
    return unsub;
  }, []);

  return null;
}
