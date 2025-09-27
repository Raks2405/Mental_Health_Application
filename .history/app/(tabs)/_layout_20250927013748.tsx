import { FontAwesome } from '@expo/vector-icons';
import { Tabs, useGlobalSearchParams } from "expo-router";
import { Text, View } from 'react-native';

export default function TabsLayout() {
    const { email } = useGlobalSearchParams<{ email?: string }>();
    const name = Array.isArray(email) ? email[0] : email;
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
           
            <Tabs.Screen name="home" initialParams={{ email: name }}

                options={{
                    tabBarLabel: 'Home',
                    href: { pathname: "/(tabs)/home", params: { email } },
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name='home' size={24} color={color} />
                    ),
                    title: 'Home',
                }}
            />

            <Tabs.Screen name="chats" initialParams={{ email }}
                options={{
                    tabBarLabel: 'Chats',
                    href: { pathname: "/(tabs)/chats", params: { email } },
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name='comment-o' size={24} color={color} />
                    ),
                    title: 'Chats'
                }} />

            <Tabs.Screen name="sessions" initialParams={{ email }}
                options={{
                    tabBarLabel: 'Sessions',
                    href: { pathname: "/(tabs)/sessions", params: { email } },
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name='book' size={24} color={color} />
                    ),
                    title: 'Sessions'
                }} />

            <Tabs.Screen name="profile" initialParams={{ email }}
                options={{
                    tabBarLabel: 'My Profile',
                    href: { pathname: "/(tabs)/profile", params: { email } },
                    
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name='user' size={24} color={color} />
                    ),
                    title: 'Profile'
                }} />

        </Tabs>

    );
}