export type AppRole = "admin" | "agent";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: AppRole;
  created_at: string;
};

export type AgentRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string;
  brokerage_name: string | null;
  created_at: string;
};

export type BuyerRow = {
  id: string;
  agent_id: string;
  buyer_name: string;
  budget_min: number | null;
  budget_max: number | null;
  notes: string | null;
  status: string | null;
  buyer_email: string | null;
  created_at: string;
  updated_at: string;
};

export type BuyerTargetLocationRow = {
  id: string;
  buyer_id: string;
  city: string | null;
  neighborhood: string | null;
  zip_code: string | null;
  created_at: string;
};

export type PropertySearchRow = {
  id: string;
  agent_id: string;
  raw_address: string;
  normalized_address: string | null;
  city: string | null;
  neighborhood: string | null;
  zip_code: string | null;
  lat: number | null;
  lng: number | null;
  price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyMatchRow = {
  id: string;
  property_id: string;
  buyer_id: string;
  match_score: number | null;
  match_reasons: string[] | null;
  created_at: string;
};

export type EmailLogRow = {
  id: string;
  property_id: string | null;
  buyer_id: string | null;
  sender_agent_id: string;
  recipient_email: string;
  subject: string;
  body: string | null;
  status: string;
  provider_message_id: string | null;
  created_at: string;
};

export type BuyerWithLocations = BuyerRow & {
  buyer_target_locations: BuyerTargetLocationRow[];
};

export type PropertyMatchWithBuyer = PropertyMatchRow & {
  buyers: Pick<BuyerRow, "id" | "buyer_name" | "buyer_email"> | null;
};

export type SellerLeadRow = {
  id: string;
  agent_id: string;
  property_address: string;
  owner_name: string | null;
  assigned_agent_id: string | null;
  tags: string[];
  city: string | null;
  state: string | null;
  zip: string | null;
  source: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
};
