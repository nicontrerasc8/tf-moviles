import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  Card,
  ErrorMessage,
  Field,
  Header,
  LoadingState,
  PrimaryButton,
  Screen,
  crmColors,
  styles,
} from '@/components/crm/ui';
import { useAuth } from '@/context/AuthContext';
import { createOpportunity, listClients, listStatuses } from '@/lib/crm';
import { Client, Status } from '@/lib/types';

export default function CreateOpportunityScreen() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [clientId, setClientId] = useState('');
  const [statusId, setStatusId] = useState('');
  const [amount, setAmount] = useState('');
  const [estimatedCloseDate, setEstimatedCloseDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      Promise.all([listClients(), listStatuses()])
        .then(([nextClients, nextStatuses]) => {
          if (!active) {
            return;
          }
          setClients(nextClients);
          setStatuses(nextStatuses);
          setClientId(nextClients[0]?.id ?? '');
          setStatusId(nextStatuses[0]?.id ?? '');
        })
        .catch((nextError: Error) => active && setError(nextError.message))
        .finally(() => active && setLoading(false));

      return () => {
        active = false;
      };
    }, [authLoading, router, session]),
  );

  async function handleSubmit() {
    const numericAmount = Number(amount.replace(',', '.'));
    if (!clientId || !statusId || !Number.isFinite(numericAmount)) {
      setError('Selecciona cliente, estado y un monto válido');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createOpportunity({
        client_id: clientId,
        status_id: statusId,
        amount: numericAmount,
        estimated_close_date: estimatedCloseDate.trim() || null,
        description: description.trim(),
      });
      router.replace('/opportunities');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No se pudo crear la oportunidad');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Header title="Nueva oportunidad" subtitle="Cliente, monto, fecha y estado inicial" />
      {loading ? <LoadingState /> : null}
      <ErrorMessage message={error} />
      {!loading ? (
        <Card>
          <Text style={styles.label}>Cliente</Text>
          <View style={{ gap: 8 }}>
            {clients.map((client) => (
              <Option key={client.id} title={client.company || client.name} selected={clientId === client.id} onPress={() => setClientId(client.id)} />
            ))}
          </View>

          <Text style={styles.label}>Estado inicial</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {statuses.map((status) => (
              <Option key={status.id} title={status.name} selected={statusId === status.id} onPress={() => setStatusId(status.id)} compact />
            ))}
          </View>

          <Field label="Monto" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="25000" />
          <Field
            label="Fecha estimada de cierre"
            value={estimatedCloseDate}
            onChangeText={setEstimatedCloseDate}
            placeholder="2026-06-30"
          />
          <Field label="Descripción" value={description} onChangeText={setDescription} multiline placeholder="Detalle comercial" />
          <PrimaryButton title="Crear oportunidad" loading={saving} onPress={handleSubmit} />
          <PrimaryButton title="Cancelar" variant="secondary" onPress={() => router.back()} />
        </Card>
      ) : null}
    </Screen>
  );
}

function Option({
  title,
  selected,
  onPress,
  compact,
}: {
  title: string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: selected ? crmColors.primary : crmColors.primarySoft,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        width: compact ? undefined : '100%',
      }}>
      <Text style={{ color: selected ? '#FFFFFF' : crmColors.primary, fontWeight: '800' }}>{title}</Text>
    </Pressable>
  );
}
