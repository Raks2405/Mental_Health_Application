import { router } from "expo-router";
import { useEffect, useState } from "react";
import { subscribeToAuth } from "../server/auth";

export default function Index() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for component to mount
    const timer = setTimeout(() => setIsReady(true), 10);
    
    const unsub = subscribeToAuth((user) => {
      if (!isReady) return; // Ignore early calls
      
      try {
        if (user) {
          router.replace("/(tabs)/home/books");
        } else {
          router.replace("/(auth)/loginpage");
        }
      } catch (error) {
        console.error("Navigation error in auth subscription:", error);
        // Fallback navigation
        try {
          router.replace("/(auth)/loginpage");
        } catch {
          // If even fallback fails, do nothing
        }
      }
    });

    return () => {
      clearTimeout(timer);
      try {
        unsub();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [isReady]);

  // Don't render anything - just handle routing
  return null;
}
