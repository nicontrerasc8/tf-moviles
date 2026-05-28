import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  Card,
  EmptyState,
  ErrorMessage,
  Header,
  LoadingState,
  PrimaryButton,
  Screen,
  formatCurrency,
  styles,
} from '@/components/crm/ui';
import { useAuth } from '@/context/AuthContext';
import { listOpportunities, listStatuses } from '@/lib/crm';
import { Opportunity, Status } from '@/lib/types';

export default function OpportunitiesScreen() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
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
      Promise.all([listOpportunities(), listStatuses()])
        .then(([nextOpportunities, nextStatuses]) => {
          if (!active) {
            return;
          }
          setOpportunities(nextOpportunities);
          setStatuses(nextStatuses);
        })
        .catch((nextError: Error) => active && setError(nextError.message))
        .finally(() => active && setLoading(false));

      return () => {
        active = false;
      };
    }, [authLoading, router, session]),
  );

  const grouped = useMemo(() => {
    return statuses.map((status) => ({
      status,
      items: opportunities.filter((item) => item.status_id === status.id || item.status?.name === status.name),
    }));
  }, [opportunities, statuses]);

  return (
    <Screen>
      <Header
        title="Pipeline"
        subtitle="Oportunidades agrupadas por estado"
        action={<PrimaryButton title="Nueva" onPress={() => router.push('/opportunities/create')} />}
      />
      <PrimaryButton title="Volver" variant="secondary" onPress={() => router.back()} />
      <ErrorMessage message={error} />
      {loading ? <LoadingState /> : null}
      {!loading && opportunities.length === 0 ? (
        <EmptyState title="Sin oportunidades" message="Crea una oportunidad para visualizar el pipeline." />
      ) : null}
      {!loading && grouped.map((group) => (
        <View key={group.status.id} style={{ gap: 10 }}>
          <Text style={[styles.emptyTitle, { marginTop: 4 }]}>{group.status.name}</Text>
          {group.items.length === 0 ? (
            <Text style={styles.emptyMessage}>No hay oportunidades en este estado.</Text>
          ) : (
            group.items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => router.push({ pathname: '/opportunities/[id]', params: { id: item.id } })}>
                <Card>
                  <Text style={styles.emptyTitle}>{item.client?.company || item.client?.name || 'Cliente'}</Text>
                  <Text style={styles.emptyMessage}>{item.description || 'Sin descripción'}</Text>
                  <Text style={styles.statLabel}>
                    {formatCurrency(item.amount)} · Cierre {item.estimated_close_date || 'sin fecha'}
                  </Text>
                </Card>
              </Pressable>
            ))
          )}
        </View>
      ))}
    </Screen>
  );
}
