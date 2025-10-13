import { getSessionListFromFirestore } from '@/src/firestore_controller';
import { useUser } from '@/src/UserContext';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs, useFocusEffect } from 'expo-router';
import * as React from 'react';
import { DeviceEventEmitter, Text, View } from 'react-native';

export default function TabsLayout() {
  // use the actual signed-in user from context
  const { user } = useUser();
  const userEmail = user?.email ?? 'anon';

  const [badgeCount, setBadgeCount] = React.useState<number | undefined>(undefined);

  const recompute = React.useCallback(async () => {
    try {
      const sessions = await getSessionListFromFirestore();
      const key = `Sessions_seen_${userEmail}`; // matches Sessions screen
      const raw = await AsyncStorage.getItem(key);
      const seen = new Set<string>(raw ? JSON.parse(raw) : []);
      const unseen = sessions.reduce((acc, s) => (s.docId && !seen.has(s.docId) ? acc + 1 : acc), 0);
      setBadgeCount(unseen > 0 ? unseen : undefined);
    } catch {
      setBadgeCount(undefined);
    }
  }, [userEmail]);

  // Recompute on first mount & when user changes
  React.useEffect(() => {
    recompute();
  }, [recompute]);

  // Recompute whenever the tabs layout regains focus
  useFocusEffect(
    React.useCallback(() => {
      recompute();
      return () => {};
    }, [recompute])
  );

  // Listen for “seen” updates emitted by the Sessions screen
  React.useEffect(() => {
    const sub = DeviceEventEmitter.addListener('sessions-seen-updated', () => {
      setTimeout(recompute, 50);
    });
    return () => sub.remove();
  }, [recompute]);

  return (
    <Tabs
      screenOptions={{
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* heart stays red */}
            <FontAwesome name="heart" size={22} color="#f30a0a" />
            <Text style={{ fontWeight: '800', fontSize: 16, color: '#f8fafc', letterSpacing: 0.3 }}>
              My Mental Health
            </Text>
          </View>
        ),
        headerTitleAlign: 'center',

        // SOLID single-color background for header & tabs
        tabBarStyle: {
          backgroundColor: '#003d53ff',
          borderTopWidth: 0,
          elevation: 0,
        },
        headerStyle: {
          backgroundColor: '#003d53ff',
          shadowColor: 'transparent',
        },
        headerTintColor: '#f8fafc',

        // Colors that read well on this solid background
        tabBarActiveTintColor: '#22d3ee',     // cyan-ish active
        tabBarInactiveTintColor: '#94a3b8',   // slate-ish inactive
        tabBarLabelStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={22} color={color} />,
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="chats"
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color }) => <FontAwesome name="comment-o" size={22} color={color} />,
          title: 'Chats',
        }}
      />

      <Tabs.Screen
        name="sessions"
        options={{
          tabBarLabel: 'Sessions',
          tabBarIcon: ({ color }) => <FontAwesome name="calendar" size={22} color={color} />,
          title: 'Sessions',
          tabBarBadge: badgeCount, // unchanged logic
          tabBarBadgeStyle: {
            backgroundColor: '#ef4444',
            color: '#fff',
            fontWeight: '800',
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'My Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={22} color={color} />,
          title: 'Profile',
        }}
      />

      {/* hide index screen from tab bar */}
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
