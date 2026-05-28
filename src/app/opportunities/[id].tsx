import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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
  formatCurrency,
  styles,
} from '@/components/crm/ui';
import { useAuth } from '@/context/AuthContext';
import {
  createOpportunityAction,
  getOpportunity,
  listOpportunityActions,
  listStatuses,
  updateOpportunityStatus,
} from '@/lib/crm';
import { Opportunity, OpportunityAction, Status } from '@/lib/types';

export default function OpportunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [actions, setActions] = useState<OpportunityAction[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) {
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([getOpportunity(id), listOpportunityActions(id), listStatuses()])
      .then(([nextOpportunity, nextActions, nextStatuses]) => {
        setOpportunity(nextOpportunity);
        setActions(nextActions);
        setStatuses(nextStatuses);
      })
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (authLoading) {
        return;
      }
      if (!session) {
        router.replace('/login');
        return;
      }
      load();
    }, [authLoading, load, router, session]),
  );

  async function handleStatusChange(statusId: string) {
    if (!opportunity || statusId === opportunity.status_id) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateOpportunityStatus({
        opportunity_id: opportunity.id,
        from_status_id: opportunity.status_id,
        to_status_id: statusId,
        comment: comment.trim() || undefined,
      });
      setComment('');
      load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No se pudo actualizar el estado');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddComment() {
    if (!opportunity || !comment.trim()) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createOpportunityAction({
        opportunity_id: opportunity.id,
        action_type: 'comment',
        comment: comment.trim(),
        from_status_id: opportunity.status_id,
        to_status_id: opportunity.status_id,
      });
      setComment('');
      load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No se pudo guardar el comentario');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Header title="Detalle" subtitle="Estado e historial de la oportunidad" />
      <PrimaryButton title="Volver" variant="secondary" onPress={() => router.back()} />
      <ErrorMessage message={error} />
      {loading || !opportunity ? (
        <LoadingState />
      ) : (
        <>
          <Card>
            <Text style={styles.emptyTitle}>
              {opportunity.client?.company || opportunity.client?.name || 'Cliente'}
            </Text>
            <Text style={styles.emptyMessage}>{opportunity.description || 'Sin descripción'}</Text>
            <Text style={styles.statValue}>{formatCurrency(opportunity.amount)}</Text>
            <Text style={styles.statLabel}>Cierre estimado: {opportunity.estimated_close_date || 'Sin fecha'}</Text>
            <Text style={styles.statLabel}>Estado actual: {opportunity.status?.name ?? 'Sin estado'}</Text>
          </Card>

          <Card>
            <Text style={styles.emptyTitle}>Actualizar estado</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {statuses.map((status) => (
                <Pressable
                  key={status.id}
                  disabled={saving}
                  onPress={() => handleStatusChange(status.id)}
                  style={{
                    backgroundColor:
                      status.id === opportunity.status_id ? crmColors.primary : crmColors.primarySoft,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                  }}>
                  <Text
                    style={{
                      color: status.id === opportunity.status_id ? '#FFFFFF' : crmColors.primary,
                      fontWeight: '800',
                    }}>
                    {status.name}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Field
              label="Comentario"
              value={comment}
              onChangeText={setComment}
              multiline
              placeholder="Agrega un comentario o motivo del cambio"
            />
            <PrimaryButton title="Guardar comentario" loading={saving} variant="secondary" onPress={handleAddComment} />
          </Card>

          <Header title="Historial" subtitle="Cambios de estado y comentarios" />
          {actions.length === 0 ? (
            <Card>
              <Text style={styles.emptyMessage}>Aún no hay acciones registradas.</Text>
            </Card>
          ) : (
            actions.map((action) => (
              <Card key={action.id}>
                <Text style={styles.emptyTitle}>
                  {action.action_type === 'status_change' ? 'Cambio de estado' : 'Comentario'}
                </Text>
                <Text style={styles.emptyMessage}>{action.comment || 'Sin comentario'}</Text>
                <Text style={styles.statLabel}>{action.created_at ? new Date(action.created_at).toLocaleString() : ''}</Text>
              </Card>
            ))
          )}
        </>
      )}
    </Screen>
  );
}
