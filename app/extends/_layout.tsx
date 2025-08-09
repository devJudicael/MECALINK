import React from 'react';
import { Stack } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import NotificationBadge from '../../components/NotificationBadge';

export default function ExtendsLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#1e293b',
        },
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ marginLeft: 10 }}
          >
            <ChevronLeft size={24} color="#2563EB" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={{ marginRight: 10 }}>
            <NotificationBadge color="#2563EB" />
          </View>
        ),
      }}
    >
      <Stack.Screen 
        name="checklist-form" 
        options={{ 
          title: 'Fiche de Pré-Démarrage',
        }} 
      />
      <Stack.Screen 
        name="checklist-history" 
        options={{ 
          title: 'Historique des Fiches',
        }} 
      />
      <Stack.Screen 
        name="checklist-details" 
        options={{ 
          title: 'Détails de la Fiche',
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          title: 'Notifications',
          headerRight: () => null, // Pas de badge de notification sur l'écran des notifications
        }} 
      />
    </Stack>
  );
}