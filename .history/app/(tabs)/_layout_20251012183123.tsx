import { getSessionListFromFirestore } from '@/src/firestore_controller';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs, useFocusEffect, useGlobalSearchParams } from 'expo-router';
import * as React from 'react';
import { DeviceEventEmitter, Text, View } from 'react-native';

export default function TabsLayout() {
  const { email } = useGlobalSearchParams<{ email?: string }>();
  const [badgeCount, setBadgeCount] = React.useState<number | undefined>(undefined);

  const recompute = React.useCallback(async () => {
    try {
      const sessions = await getSessionListFromFirestore();
      const key = `Sessions_seen_${email ?? 'anon'}`;
      const raw = await AsyncStorage.getItem(key);
      const seen = new Set<string>(raw ? JSON.parse(raw) : []);
      const unseen = sessions.reduce((acc, s) => (s.docId && !seen.has(s.docId) ? acc + 1 : acc), 0);
      setBadgeCount(unseen > 0 ? unseen : undefined);
    } catch {
      setBadgeCount(undefined);
    }
  }, [email]);

  // Recompute on first mount & when email changes
  React.useEffect(() => {
    recompute();
  }, [recompute]);

  // Recompute whenever the tabs layout regains focus (switching tabs / returning)
  useFocusEffect(
    React.useCallback(() => {
      recompute();
      return () => {};
    }, [recompute])
  );

  // Listen for “seen” updates from Sessions screen
  React.useEffect(() => {
    const sub = DeviceEventEmitter.addListener('sessions-seen-updated', () => {
      setTimeout(recompute, 50); // small debounce to let AsyncStorage write finish
    });
    return () => sub.remove();
  }, [recompute]);

  return (
    <Tabs
      screenOptions={{
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <FontAwesome name="heart" size={24} color="#f30a0aff" />
            <Text style={{ fontWeight: '600', fontSize: 16, color: '#f8fafc' }}>
              My Mental Health
            </Text>
          </View>
        ),
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#22d3ee',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#003d53ff' },
        headerStyle: { backgroundColor: '#003d53ff' },
        headerTintColor: '#f8fafc',
      }}
    >
      <Tabs.Screen
        name="home"
        initialParams={{ email }}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="chats"
        initialParams={{ email }}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color }) => <FontAwesome name="comment-o" size={24} color={color} />,
          title: 'Chats',
        }}
      />

      <Tabs.Screen
        name="sessions"
        initialParams={{ email }}
        options={{
          tabBarLabel: 'Sessions',
          tabBarIcon: ({ color }) => <FontAwesome name="calendar" size={24} color={color} />,
          title: 'Sessions',
          tabBarBadge: badgeCount, // ← updates automatically
          tabBarBadgeStyle: { backgroundColor: 'red' },
        }}
      />

      <Tabs.Screen
        name="profile"
        initialParams={{ email }}
        options={{
          tabBarLabel: 'My Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
          title: 'Profile',
        }}
      />

      {/* hide index screen from tab bar */}
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
