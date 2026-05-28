import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text } from 'react-native';

import {
  Card,
  EmptyState,
  ErrorMessage,
  Header,
  LoadingState,
  PrimaryButton,
  Screen,
  styles,
} from '@/components/crm/ui';
import { useAuth } from '@/context/AuthContext';
import { listClients } from '@/lib/crm';
import { Client } from '@/lib/types';

export default function ClientsScreen() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (authLoading) {
        return;
      }
      if (!session) {
        router.replace('/login');
        return;
      }

      let active = true;
      setLoading(true);
      setError(null);
      listClients()
        .then((data) => active && setClients(data))
        .catch((nextError: Error) => active && setError(nextError.message))
        .finally(() => active && setLoading(false));

      return () => {
        active = false;
      };
    }, [authLoading, router, session]),
  );

  return (
    <Screen>
      <Header
        title="Clientes"
        subtitle="Registro comercial"
        action={<PrimaryButton title="Nuevo" onPress={() => router.push('/clients/create')} />}
      />
      <PrimaryButton title="Volver" variant="secondary" onPress={() => router.back()} />
      <ErrorMessage message={error} />
      {loading ? <LoadingState /> : null}
      {!loading && clients.length === 0 ? (
        <EmptyState title="Sin clientes" message="Registra el primer cliente para crear oportunidades." />
      ) : null}
      {clients.map((client) => (
        <Card key={client.id}>
          <Text style={styles.emptyTitle}>{client.company || client.name}</Text>
          <Text style={styles.emptyMessage}>{client.name}</Text>
          <Text style={styles.statLabel}>{client.contact || 'Sin contacto'}</Text>
          <Text style={styles.statLabel}>{client.phone || client.email || 'Sin datos de contacto'}</Text>
          {client.address ? <Text style={styles.emptyMessage}>{client.address}</Text> : null}
        </Card>
      ))}
    </Screen>
  );
}
