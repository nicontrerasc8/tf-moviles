export type Client = {
  id: string;
  name: string;
  company: string | null;
  contact: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at?: string;
};

export type Status = {
  id: string;
  name: string;
};

export type Opportunity = {
  id: string;
  client_id: string;
  status_id: string;
  amount: number;
  estimated_close_date: string | null;
  description: string | null;
  created_at?: string;
  client?: Client | null;
  status?: Status | null;
};

export type OpportunityAction = {
  id: string;
  opportunity_id: string;
  action_type: string;
  comment: string | null;
  from_status_id: string | null;
  to_status_id: string | null;
  created_at?: string;
};

export type Metrics = {
  totalOpportunities: number;
  totalAmount: number;
  wonOpportunities: number;
  conversionRate: number;
};
