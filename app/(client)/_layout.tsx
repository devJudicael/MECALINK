import React from 'react';
import { Tabs } from 'expo-router';
import { Map, List, History, User, ListCheck, Bell } from 'lucide-react-native';
import { usePushNotifications } from '@/hooks/usePushNotifications';
export default function ClientLayout() {
  const { expoPushToken } = usePushNotifications();

  console.log('--- expoPushToken ----> ', expoPushToken);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,

          // overflowX: "hidden",
          width: '100%',
          justifyContent: 'center',

          alignItems: 'center',

          bottom: 0,
          position: 'absolute',
          // overflowX: "hidden",
          alignContent: 'center',
          alignSelf: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Carte',
          tabBarIcon: ({ size, color }) => <Map size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="garages"
        options={{
          title: 'Garages',
          tabBarIcon: ({ size, color }) => <List size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historique',
          tabBarIcon: ({ size, color }) => (
            <History size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="checklist"
        options={{
          title: 'Fiche',
          tabBarIcon: ({ size, color }) => (
            <ListCheck size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ size, color }) => <Bell size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
