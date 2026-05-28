import { useRouter } from 'expo-router';
import { useState } from 'react';

import { Card, ErrorMessage, Field, Header, PrimaryButton, Screen } from '@/components/crm/ui';
import { createClient } from '@/lib/crm';

export default function CreateClientScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createClient({
        name: name.trim(),
        company: company.trim() || null,
        contact: contact.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
      });
      router.replace('/clients');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No se pudo registrar el cliente');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Header title="Nuevo cliente" subtitle="Datos de contacto y empresa" />
      <Card>
        <Field label="Nombre" value={name} onChangeText={setName} placeholder="Nombre del cliente" />
        <Field label="Empresa" value={company} onChangeText={setCompany} placeholder="Empresa" />
        <Field label="Contacto" value={contact} onChangeText={setContact} placeholder="Persona de contacto" />
        <Field label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+51..." />
        <Field
          label="Correo"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="correo@empresa.com"
        />
        <Field label="Dirección" value={address} onChangeText={setAddress} multiline placeholder="Dirección" />
        <ErrorMessage message={error} />
        <PrimaryButton title="Guardar cliente" loading={loading} onPress={handleSubmit} />
        <PrimaryButton title="Cancelar" variant="secondary" onPress={() => router.back()} />
      </Card>
    </Screen>
  );
}
