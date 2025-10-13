import { getSessionListFromFirestore } from '@/src/firestore_controller';
import { useUser } from '@/src/UserContext';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, useFocusEffect } from 'expo-router';
import * as React from 'react';
import { DeviceEventEmitter, StyleSheet, Text, View } from 'react-native';

export default function TabsLayout() {
  // 🔑 use the actual signed-in user from context
  const { user } = useUser();
  const userEmail = user?.email ?? 'anon';

  const [badgeCount, setBadgeCount] = React.useState<number | undefined>(undefined);

  const recompute = React.useCallback(async () => {
    try {
      const sessions = await getSessionListFromFirestore();
      const key = `Sessions_seen_${userEmail}`;
      const raw = await AsyncStorage.getItem(key);
      const seen = new Set<string>(raw ? JSON.parse(raw) : []);
      const unseen = sessions.reduce((acc, s) => (s.docId && !seen.has(s.docId) ? acc + 1 : acc), 0);
      setBadgeCount(unseen > 0 ? unseen : undefined);
    } catch {
      setBadgeCount(undefined);
    }
  }, [userEmail]);

  React.useEffect(() => {
    recompute();
  }, [recompute]);

  useFocusEffect(
    React.useCallback(() => {
      recompute();
      return () => {};
    }, [recompute])
  );

  React.useEffect(() => {
    const sub = DeviceEventEmitter.addListener('sessions-seen-updated', () => {
      setTimeout(recompute, 50);
    });
    return () => sub.remove();
  }, [recompute]);

  return (
    <Tabs
      screenOptions={{
        // gradient header
        headerBackground: () => (
          <LinearGradient
            colors={['#2372a7ff', '#168895ff', '#032527ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        ),
        // gradient tab bar
        tabBarBackground: () => (
          <LinearGradient
            colors={['#032527ff', '#168895ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        ),

        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <FontAwesome name="heart" size={22} color="#ffffff" />
            <Text style={{ fontWeight: '800', fontSize: 16, color: '#f8fafc', letterSpacing: 0.3 }}>
              My Mental Health
            </Text>
          </View>
        ),
        headerTitleAlign: 'center',

        // tab colors
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.7)',
        // make labels a tad bolder for readability on gradient
        tabBarLabelStyle: { fontWeight: '700' },

        // remove default solids so gradients show cleanly
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
        },
        headerStyle: {
          backgroundColor: 'transparent',
          shadowColor: 'transparent',
        },
        headerTintColor: '#f8fafc',
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
            backgroundColor: '#ef4444', // red-500
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
