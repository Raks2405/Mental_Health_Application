import { FontAwesome } from '@expo/vector-icons';
import { Tabs, useGlobalSearchParams } from "expo-router";
import { Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { getSessionListFromFirestore, Session } from '@/src/firestore_controller';

export default function TabsLayout() {
    const { email } = useGlobalSearchParams<{ email?: string }>();
    const [badgeCount, setBadgeCount] = useState<number | undefined>(undefined);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                // fetch sessions
                const sessions: Session[] = await getSessionListFromFirestore();
                const key = `Sessions_seen_${email ?? 'anon'}`;
                const raw = await AsyncStorage.getItem(key);
                const seen = raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();

                // compute unseen
                const unseen = sessions.reduce((acc, s) => {
                    const id = s.docId;
                    return acc + (id && !seen.has(id) ? 1 : 0);
                }, 0);

                if (!alive) return;
                setBadgeCount(unseen > 0 ? unseen : undefined);
            } catch {
                if (!alive) return;
                setBadgeCount(undefined);
            }
        })();
        return () => { alive = false; };
    }, [email]);
    return (
        <Tabs screenOptions={{
            headerTitle: () => (

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <FontAwesome name='heart' size={24} color='#f30a0aff' />
                    <Text style={{ fontWeight: '600', fontSize: 16, color: '#f8fafc' }}>
                        My Mental Health
                    </Text>
                </View>
            ),
            headerTitleAlign: 'center',

            tabBarActiveTintColor: '#22d3ee',
            tabBarInactiveTintColor: '#94a3b8',
            tabBarStyle: {
                backgroundColor: '#003d53ff'
            },
            headerStyle: {
                backgroundColor: '#003d53ff'
            },
            headerTintColor: '#f8fafc'

        }}>

            <Tabs.Screen name="home" initialParams={{ email }}

                options={{
                    tabBarLabel: 'Home',

                    tabBarIcon: ({ color }) => (
                        <FontAwesome name='home' size={24} color={color} />
                    ),
                    title: 'Home',
                }}
            />

            <Tabs.Screen name="chats" initialParams={{ email }}
                options={{
                    tabBarLabel: 'Chats',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name='comment-o' size={24} color={color} />
                    ),
                    title: 'Chats'
                }} />

            <Tabs.Screen name="sessions" initialParams={{ email }}
                options={{
                    tabBarLabel: 'Sessions',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name='calendar' size={24} color={color} />
                    ),
                    title: 'Sessions',
                    tabBarBadge: badgeCount,                          // ← here
                    tabBarBadgeStyle: { backgroundColor: 'red' },
                }} />

            <Tabs.Screen name="profile" initialParams={{ email }}
                options={{
                    tabBarLabel: 'My Profile',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name='user' size={24} color={color} />
                    ),
                    title: 'Profile'
                }} />

            {/* hide index screen from tab bar */}
            <Tabs.Screen name="index"
                options={{ href: null }} />

        </Tabs>

    );
}