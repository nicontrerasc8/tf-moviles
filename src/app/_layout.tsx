import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F5F7FA' },
        }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="index" />
        <Stack.Screen name="clients/index" />
        <Stack.Screen name="clients/create" />
        <Stack.Screen name="opportunities/index" />
        <Stack.Screen name="opportunities/create" />
        <Stack.Screen name="opportunities/[id]" />
        <Stack.Screen name="metrics" />
      </Stack>
    </AuthProvider>
  );
}
