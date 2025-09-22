import { FontAwesome } from '@expo/vector-icons';
import { Tabs, useGlobalSearchParams } from "expo-router";
import { Text, View } from 'react-native';

export default function TabsLayout() {
    const { username } = useGlobalSearchParams<{ username?: string }>();
    const name = Array.isArray(username) ? username[0] : username;
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
            <Tabs
                screenOptions={{ freezeOnBlur: true }}
                detachInactiveScreens={false}   // optional: keep tab screens mounted
            ></Tabs>
            <Tabs.Screen name="home" initialParams={{ username: name }}

                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name='home' size={24} color={color} />
                    ),
                    title: 'Home',
                }}
            />

            <Tabs.Screen
                name="home" initialParams={{ username: name }}

                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name='home' size={24} color={color} />
                    ),
                    title: 'Home'
                }} />

            <Tabs.Screen name="chats"
                options={{
                    tabBarLabel: 'Chats',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name='comment-o' size={24} color={color} />
                    ),
                    title: 'Chats'
                }} />

            <Tabs.Screen name="sessions"
                options={{
                    tabBarLabel: 'Sessions',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name='book' size={24} color={color} />
                    ),
                    title: 'Sessions'
                }} />

            <Tabs.Screen name="profile" initialParams={{ username: name }}
                options={{
                    tabBarLabel: 'My Profile',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name='user' size={24} color={color} />
                    ),
                    title: 'Profile'
                }} />

            <Tabs.Screen name="hometabs" options={{ href: null }} />  {/* hidden tab */}
        </Tabs>

    );
}