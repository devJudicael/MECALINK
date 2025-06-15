import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '../context/AuthContext';
import { ServiceProvider } from '../context/ServiceContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <ServiceProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(client)" />
          <Stack.Screen name="(garage)" />
          <Stack.Screen name="garage-details" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ServiceProvider>
    </AuthProvider>
  );
}
