import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import {
  ErrorMessage,
  Header,
  LoadingState,
  PrimaryButton,
  Screen,
  StatCard,
  formatCurrency,
} from '@/components/crm/ui';
import { useAuth } from '@/context/AuthContext';
import { getMetrics } from '@/lib/crm';
import { Metrics } from '@/lib/types';

export default function MetricsScreen() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
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
      getMetrics()
        .then((data) => active && setMetrics(data))
        .catch((nextError: Error) => active && setError(nextError.message))
        .finally(() => active && setLoading(false));

      return () => {
        active = false;
      };
    }, [authLoading, router, session]),
  );

  return (
    <Screen>
      <Header title="Métricas" subtitle="Resumen básico del pipeline" />
      <PrimaryButton title="Volver" variant="secondary" onPress={() => router.back()} />
      <ErrorMessage message={error} />
      {loading ? (
        <LoadingState />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <StatCard label="Total oportunidades" value={`${metrics?.totalOpportunities ?? 0}`} />
          <StatCard label="Monto total" value={formatCurrency(metrics?.totalAmount ?? 0)} />
          <StatCard label="Ganadas" value={`${metrics?.wonOpportunities ?? 0}`} tone="success" />
          <StatCard label="Conversión" value={`${metrics?.conversionRate ?? 0}%`} />
        </View>
      )}
    </Screen>
  );
}
