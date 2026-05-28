import { supabase } from './supabase';
import { Metrics, Client, Opportunity, OpportunityAction, Status } from './types';
import { PIPELINE_STATUSES, WON_STATUS } from './status';

type ClientRow = Client & { user_id?: string };
type StatusRow = Status;
type OpportunityRow = Opportunity & {
  user_id?: string;
  clients?: ClientRow | ClientRow[] | null;
  status?: StatusRow | StatusRow[] | null;
};
type ActionRow = OpportunityAction & { user_id?: string };

function getUserId() {
  return supabase.auth.getUser().then(({ data, error }) => {
    if (error) {
      throw error;
    }
    return data.user?.id;
  });
}

function normalizeOpportunity(row: OpportunityRow): Opportunity {
  const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;
  const status = Array.isArray(row.status) ? row.status[0] : row.status;

  return {
    id: row.id,
    client_id: row.client_id,
    status_id: row.status_id,
    amount: Number(row.amount ?? 0),
    estimated_close_date: row.estimated_close_date,
    description: row.description,
    created_at: row.created_at,
    client: client ?? row.client ?? null,
    status: status ?? null,
  };
}

export async function listClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('id,name,company,contact,phone,email,address,created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Client[];
}

export async function createClient(input: Omit<Client, 'id'>) {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...input, user_id: userId })
    .select('id,name,company,contact,phone,email,address,created_at')
    .single();

  if (error) {
    throw error;
  }

  return data as Client;
}

export async function listStatuses() {
  const { data, error } = await supabase.from('status').select('id,name').order('id');

  if (error) {
    throw error;
  }

  const statuses = (data ?? []) as Status[];
  return statuses.length > 0 ? statuses : PIPELINE_STATUSES.map((name) => ({ id: name, name }));
}

export async function listOpportunities() {
  const { data, error } = await supabase
    .from('opportunities')
    .select(
      'id,client_id,status_id,amount,estimated_close_date,description,created_at,clients(id,name,company,contact,phone,email,address),status(id,name)',
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as OpportunityRow[]).map(normalizeOpportunity);
}

export async function getOpportunity(id: string) {
  const { data, error } = await supabase
    .from('opportunities')
    .select(
      'id,client_id,status_id,amount,estimated_close_date,description,created_at,clients(id,name,company,contact,phone,email,address),status(id,name)',
    )
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return normalizeOpportunity(data as unknown as OpportunityRow);
}

export async function createOpportunity(input: {
  client_id: string;
  amount: number;
  estimated_close_date: string | null;
  description: string;
  status_id: string;
}) {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('opportunities')
    .insert({ ...input, user_id: userId })
    .select('id,client_id,status_id,amount,estimated_close_date,description,created_at')
    .single();

  if (error) {
    throw error;
  }

  await createOpportunityAction({
    opportunity_id: data.id,
    action_type: 'created',
    comment: 'Oportunidad creada',
    from_status_id: null,
    to_status_id: input.status_id,
  });

  return data as Opportunity;
}

export async function updateOpportunityStatus(input: {
  opportunity_id: string;
  from_status_id: string | null;
  to_status_id: string;
  comment?: string;
}) {
  const { error } = await supabase
    .from('opportunities')
    .update({ status_id: input.to_status_id })
    .eq('id', input.opportunity_id);

  if (error) {
    throw error;
  }

  await createOpportunityAction({
    opportunity_id: input.opportunity_id,
    action_type: 'status_change',
    comment: input.comment ?? 'Cambio de estado',
    from_status_id: input.from_status_id,
    to_status_id: input.to_status_id,
  });
}

export async function createOpportunityAction(input: Omit<OpportunityAction, 'id' | 'created_at'>) {
  const userId = await getUserId();
  const { error } = await supabase
    .from('opportunity_actions')
    .insert({ ...input, user_id: userId });

  if (error) {
    throw error;
  }
}

export async function listOpportunityActions(opportunityId: string) {
  const { data, error } = await supabase
    .from('opportunity_actions')
    .select('id,opportunity_id,action_type,comment,from_status_id,to_status_id,created_at')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ActionRow[];
}

export async function getMetrics(): Promise<Metrics> {
  const opportunities = await listOpportunities();
  const totalAmount = opportunities.reduce((sum, item) => sum + item.amount, 0);
  const wonOpportunities = opportunities.filter((item) => item.status?.name === WON_STATUS).length;
  const conversionRate =
    opportunities.length === 0 ? 0 : Math.round((wonOpportunities / opportunities.length) * 100);

  return {
    totalOpportunities: opportunities.length,
    totalAmount,
    wonOpportunities,
    conversionRate,
  };
}
