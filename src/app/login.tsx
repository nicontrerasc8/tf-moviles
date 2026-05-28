import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Card, ErrorMessage, Field, Header, PrimaryButton, Screen, crmColors } from '@/components/crm/ui';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { session, loading: authLoading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && session) {
      router.replace('/');
    }
  }, [authLoading, router, session]);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      router.replace('/');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ minHeight: 180, justifyContent: 'center' }}>
        <Text style={{ color: crmColors.primary, fontSize: 36, fontWeight: '900' }}>CIDELSA</Text>
        <Text style={{ color: crmColors.muted, marginTop: 8 }}>CRM móvil comercial</Text>
      </View>
      <Card>
        <Header title="Iniciar sesión" subtitle="Usa tu usuario de Supabase Auth" />
        <Field
          label="Correo"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="correo@empresa.com"
        />
        <Field
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Tu contraseña"
        />
        <ErrorMessage message={error} />
        <PrimaryButton title="Entrar" loading={loading} onPress={handleLogin} />
      </Card>
    </Screen>
  );
}
