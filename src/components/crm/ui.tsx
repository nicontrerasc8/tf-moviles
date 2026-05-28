import { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const crmColors = {
  primary: '#062B49',
  primarySoft: '#E8F0F7',
  accent: '#1B75BB',
  background: '#F5F7FA',
  card: '#FFFFFF',
  border: '#DDE5EE',
  muted: '#64748B',
  text: '#102033',
  danger: '#B42318',
  success: '#067647',
};

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>{children}</ScrollView>
    </SafeAreaView>
  );
}

export function Header({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'danger' && styles.dangerButton,
        (pressed || loading) && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? crmColors.primary : '#FFFFFF'} />
      ) : (
        <Text style={[styles.buttonText, variant === 'secondary' && styles.secondaryButtonText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  autoCapitalize = 'sentences',
  secureTextEntry,
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <Card>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMessage}>{message}</Text> : null}
    </Card>
  );
}

export function LoadingState() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={crmColors.primary} />
    </View>
  );
}

export function ErrorMessage({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }
  return <Text style={styles.error}>{message}</Text>;
}

export function StatCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'success';
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, tone === 'success' && styles.successText]}>{value}</Text>
    </View>
  );
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: crmColors.background,
  },
  screen: {
    gap: 16,
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: crmColors.primary,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: crmColors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: crmColors.card,
    borderColor: crmColors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  button: {
    alignItems: 'center',
    backgroundColor: crmColors.primary,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButton: {
    backgroundColor: crmColors.primarySoft,
  },
  dangerButton: {
    backgroundColor: crmColors.danger,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: crmColors.primary,
  },
  pressed: {
    opacity: 0.75,
  },
  field: {
    gap: 6,
  },
  label: {
    color: crmColors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: crmColors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: crmColors.text,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  multiline: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  emptyTitle: {
    color: crmColors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyMessage: {
    color: crmColors.muted,
    lineHeight: 20,
  },
  loading: {
    alignItems: 'center',
    padding: 32,
  },
  error: {
    color: crmColors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  statCard: {
    backgroundColor: crmColors.card,
    borderColor: crmColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: '47%',
    padding: 16,
  },
  statLabel: {
    color: crmColors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  statValue: {
    color: crmColors.primary,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  successText: {
    color: crmColors.success,
  },
});
