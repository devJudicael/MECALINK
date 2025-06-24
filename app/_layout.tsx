import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '../context/AuthContext';
import { ServiceProvider } from '../context/ServiceContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <ServiceProvider>
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: '#000',
            }}
          >
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="(client)" />
              <Stack.Screen name="(garage)" />
              <Stack.Screen name="garage-details" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </SafeAreaView>
        </ServiceProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
