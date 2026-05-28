import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import {
  Card,
  EmptyState,
  ErrorMessage,
  Header,
  LoadingState,
  PrimaryButton,
  Screen,
  StatCard,
  formatCurrency,
  styles,
} from '@/components/crm/ui';
import { useAuth } from '@/context/AuthContext';
import { getMetrics, listOpportunities } from '@/lib/crm';
import { Metrics, Opportunity } from '@/lib/types';

export default function HomeScreen() {
  const router = useRouter();
  const { session, loading: authLoading, signOut } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recent, setRecent] = useState<Opportunity[]>([]);
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
      Promise.all([getMetrics(), listOpportunities()])
        .then(([nextMetrics, opportunities]) => {
          if (!active) {
            return;
          }
          setMetrics(nextMetrics);
          setRecent(opportunities.slice(0, 3));
        })
        .catch((nextError: Error) => active && setError(nextError.message))
        .finally(() => active && setLoading(false));

      return () => {
        active = false;
      };
    }, [authLoading, router, session]),
  );

  if (authLoading || loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        title="CIDELSA CRM"
        subtitle="Pipeline comercial y seguimiento de oportunidades"
        action={<PrimaryButton title="Salir" variant="secondary" onPress={signOut} />}
      />
      <ErrorMessage message={error} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <StatCard label="Oportunidades" value={`${metrics?.totalOpportunities ?? 0}`} />
        <StatCard label="Monto total" value={formatCurrency(metrics?.totalAmount ?? 0)} />
      </View>

      <Card>
        <Text style={styles.emptyTitle}>Accesos rápidos</Text>
        <PrimaryButton title="Clientes" onPress={() => router.push('/clients')} />
        <PrimaryButton title="Pipeline" onPress={() => router.push('/opportunities')} />
        <PrimaryButton title="Métricas" variant="secondary" onPress={() => router.push('/metrics')} />
      </Card>

      <Header title="Recientes" subtitle="Últimas oportunidades registradas" />
      {recent.length === 0 ? (
        <EmptyState title="Sin oportunidades" message="Crea una oportunidad para iniciar el pipeline." />
      ) : (
        recent.map((item) => (
          <Card key={item.id}>
            <Text style={styles.emptyTitle}>{item.client?.company || item.client?.name || 'Cliente'}</Text>
            <Text style={styles.emptyMessage}>{item.description || 'Sin descripción'}</Text>
            <Text style={styles.statLabel}>
              {formatCurrency(item.amount)} · {item.status?.name ?? 'Sin estado'}
            </Text>
          </Card>
        ))
      )}
    </Screen>
  );
}
