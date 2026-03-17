/**
 * Seed script: creates auth users and populates all public tables.
 * Requires in .env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run: pnpm run seed (or npx tsx scripts/seed.ts)
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Load .env.local if present (overrides .env)
import { config } from "dotenv";
config({ path: ".env.local", override: true });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY. Set them in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const SEED_PASSWORD = "seedpassword123";

async function main() {
  console.log("Seeding...");

  // 1. Create auth users (trigger creates profiles with role 'agent')
  const adminEmail = "admin@example.com";
  const agent1Email = "oranshevach@example.com";
  const agent2Email = "galmoshe@example.com";

  const { data: adminUser, error: adminErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: SEED_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Admin User" },
  });
  if (adminErr) {
    if (adminErr.message.includes("already been registered")) {
      console.log("Admin user already exists, skipping.");
    } else {
      console.error("Admin user:", adminErr);
      throw adminErr;
    }
  }
  const adminId = adminUser?.user?.id;

  const { data: agent1User, error: e1Err } = await supabase.auth.admin.createUser({
    email: agent1Email,
    password: SEED_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Oran Shevach" },
  });
  if (e1Err && !e1Err.message.includes("already been registered")) {
    console.error("Agent1:", e1Err);
    throw e1Err;
  }
  const agent1Id = agent1User?.user?.id;

  const { data: agent2User, error: e2Err } = await supabase.auth.admin.createUser({
    email: agent2Email,
    password: SEED_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Gal Moshe" },
  });
  if (e2Err && !e2Err.message.includes("already been registered")) {
    console.error("Agent2:", e2Err);
    throw e2Err;
  }
  const agent2Id = agent2User?.user?.id;

  // If users already existed, fetch their ids from profiles
  let adminUid = adminId;
  let agent1Uid = agent1Id;
  let agent2Uid = agent2Id;
  if (!adminUid || !agent1Uid || !agent2Uid) {
    const { data: profiles } = await supabase.from("profiles").select("id, email").in("email", [adminEmail, agent1Email, agent2Email]);
    profiles?.forEach((p) => {
      if (p.email === adminEmail) adminUid = p.id;
      if (p.email === agent1Email) agent1Uid = p.id;
      if (p.email === agent2Email) agent2Uid = p.id;
    });
  }

  // 2. Set admin role
  if (adminUid) {
    await supabase.from("profiles").update({ role: "admin" }).eq("id", adminUid);
    console.log("Profile role 'admin' set for", adminEmail);
  }

  // 3. Get or create agents (user_id -> agents)
  let agents: { id: string; user_id: string; email: string; display_name: string }[] = [];
  for (const [email, name, uid] of [
    [agent1Email, "Oran Shevach", agent1Uid],
    [agent2Email, "Gal Moshe", agent2Uid],
  ] as [string, string, string | undefined][]) {
    if (!uid) continue;
    const { data: existing } = await supabase.from("agents").select("id").eq("user_id", uid).single();
    if (existing) {
      agents.push({ id: existing.id, user_id: uid, email, display_name: name });
      continue;
    }
    const { data: inserted, error } = await supabase
      .from("agents")
      .insert({ user_id: uid, email, display_name: name, brokerage_name: "Example Realty" })
      .select("id, user_id, email, display_name")
      .single();
    if (error) {
      console.error("Insert agent:", error);
      throw error;
    }
    agents.push(inserted as { id: string; user_id: string; email: string; display_name: string });
  }
  const agent1 = agents[0];
  const agent2 = agents[1];
  if (!agent1 || !agent2) {
    console.error("Need at least 2 agents. Create users first.");
    throw new Error("Missing agents");
  }
  console.log("Agents:", agents.length);

  // Skip rest if already seeded
  const { count } = await supabase.from("buyers").select("id", { count: "exact", head: true });
  if (count && count > 0) {
    console.log("Buyers already exist, skipping buyers/properties/matches/logs.");
    await seedSellerLeads();
    printSummary(adminEmail, agent1Email, agent2Email);
    return;
  }

  // 4. Buyers + buyer_target_locations (inspired by mock-data)
  const buyersData = [
    { name: "Etai + Niki", agent: agent1, budget_min: null, budget_max: 1_600_000, notes: "Updated with pool", email: "etai@example.com", locations: [{ city: "Woodland Hills", neighborhood: "West Hi", zip: "91367" }, { city: "Tarzana", neighborhood: "Woodland Hills", zip: null }] },
    { name: "Josh Mehdian", agent: agent1, budget_min: null, budget_max: 4_000_000, notes: "17k+ flat lot. House 3500 sq ft + South of Ventura only", email: "josh@example.com", locations: [{ city: "Brentwood", neighborhood: "Culver C", zip: null }, { city: "Calabasas", neighborhood: null, zip: null }, { city: "Los Angeles", neighborhood: null, zip: "90012" }] },
    { name: "Sarah Chen", agent: agent1, budget_min: null, budget_max: 1_200_000, notes: "Move in ready - room for 3+ cars", email: "sarah@example.com", locations: [{ city: "Los Angeles", neighborhood: null, zip: null }] },
    { name: "Mike Torres", agent: agent2, budget_min: null, budget_max: 1_400_000, notes: "Townhouse/condo 2+ bed HOA <$700", email: "mike@example.com", locations: [{ city: "Woodland Hills", neighborhood: "West Hi", zip: "91367" }, { city: "West Hills", neighborhood: null, zip: null }] },
    { name: "Alex Kim", agent: agent2, budget_min: null, budget_max: 2_500_000, notes: "", email: "alex@example.com", locations: [{ city: "Brentwood", neighborhood: null, zip: null }] },
    { name: "Jordan Lee", agent: agent2, budget_min: null, budget_max: 1_800_000, notes: "Prefer single story", email: "jordan@example.com", locations: [{ city: "Calabasas", neighborhood: "Woodland Hills", zip: null }, { city: "Tarzana", neighborhood: "Culver C", zip: null }] },
  ];

  const buyerIds: string[] = [];
  for (const b of buyersData) {
    const { data: buyer, error } = await supabase
      .from("buyers")
      .insert({
        agent_id: b.agent.id,
        buyer_name: b.name,
        budget_min: b.budget_min,
        budget_max: b.budget_max,
        notes: b.notes,
        buyer_email: b.email,
      })
      .select("id")
      .single();
    if (error) {
      console.error("Insert buyer:", error);
      throw error;
    }
    buyerIds.push(buyer.id);
    for (const loc of b.locations) {
      await supabase.from("buyer_target_locations").insert({
        buyer_id: buyer.id,
        city: loc.city,
        neighborhood: loc.neighborhood,
        zip_code: loc.zip,
      });
    }
  }
  console.log("Buyers + locations:", buyerIds.length);

  // 5. Property searches
  const propsData = [
    { agent: agent1, raw_address: "5334 Baylor Pl, Woodland Hills, CA 91367", city: "Woodland Hills", neighborhood: "West Hi", zip: "91367", lat: 34.1684, lng: -118.605, price: 1_200_000 },
    { agent: agent1, raw_address: "200 N Spring St, Los Angeles, CA 90012", city: "Los Angeles", neighborhood: null, zip: "90012", lat: 34.0537, lng: -118.2427, price: null },
    { agent: agent2, raw_address: "1500 Ocean Ave, Santa Monica, CA 90401", city: "Santa Monica", neighborhood: null, zip: "90401", lat: 34.0195, lng: -118.4912, price: 2_800_000 },
  ];

  const propertyIds: string[] = [];
  for (const p of propsData) {
    const { data: row, error } = await supabase
      .from("property_searches")
      .insert({
        agent_id: p.agent.id,
        raw_address: p.raw_address,
        city: p.city,
        neighborhood: p.neighborhood,
        zip_code: p.zip,
        lat: p.lat,
        lng: p.lng,
        price: p.price,
      })
      .select("id")
      .single();
    if (error) throw error;
    propertyIds.push(row.id);
  }
  console.log("Property searches:", propertyIds.length);

  // 6. Property matches (Woodland Hills property -> Etai+Niki, Mike; LA -> Josh, Sarah; etc.)
  const matchRules = [
    { propertyIndex: 0, buyerIndices: [0, 3], reasons: ["target_city_match", "neighborhood_match"], score: 70 },
    { propertyIndex: 1, buyerIndices: [1, 2], reasons: ["target_city_match"], score: 40 },
    { propertyIndex: 2, buyerIndices: [1], reasons: ["target_city_match"], score: 40 },
  ];
  for (const m of matchRules) {
    const propertyId = propertyIds[m.propertyIndex];
    for (const bi of m.buyerIndices) {
      await supabase.from("property_matches").insert({
        property_id: propertyId,
        buyer_id: buyerIds[bi],
        match_score: m.score,
        match_reasons: m.reasons,
      });
    }
  }
  console.log("Property matches inserted.");

  // 7. Email logs (sample)
  await supabase.from("email_logs").insert([
    { sender_agent_id: agent1.id, property_id: propertyIds[0], buyer_id: buyerIds[0], recipient_email: "etai@example.com", subject: "Property match: 5334 Baylor Pl", body: "Hi, a property matching your criteria...", status: "sent" },
    { sender_agent_id: agent2.id, property_id: propertyIds[2], buyer_id: buyerIds[1], recipient_email: "josh@example.com", subject: "Santa Monica listing", body: "Hi Josh, thought of you...", status: "sent" },
  ]);
  console.log("Email logs inserted.");

  await seedSellerLeads();
  printSummary(adminEmail, agent1Email, agent2Email);
}

// Seed seller_leads if table exists and is empty (run after migrations 001–004)
async function seedSellerLeads() {
  const { count } = await supabase.from("seller_leads").select("id", { count: "exact", head: true });
  if (count && count > 0) {
    console.log("Seller leads already exist, skipping.");
    return;
  }
  const { data: agents } = await supabase.from("agents").select("id").limit(2);
  if (!agents?.length) return;
  const [agent1, agent2] = agents as { id: string }[];
  await supabase.from("seller_leads").insert([
    { agent_id: agent1.id, property_address: "5334 Baylor Pl, Woodland Hills, CA 91367", owner_name: "Jane Doe", assigned_agent_id: agent1.id, tags: ["Hot Lead", "Expired Listing"], city: "Woodland Hills", state: "CA", zip: "91367", source: "Zillow", status: "New" },
    { agent_id: agent1.id, property_address: "2100 Main St, Santa Monica, CA 90405", owner_name: "John Smith", assigned_agent_id: agent2.id, tags: ["Other"], city: "Santa Monica", state: "CA", zip: "90405", source: "Referral", status: "Contacted" },
    { agent_id: agent2.id, property_address: "100 Ocean Dr, Venice, CA 90291", owner_name: null, assigned_agent_id: null, tags: [], city: "Venice", state: "CA", zip: "90291", source: "Website", status: "Qualified" },
  ]);
  console.log("Seller leads inserted.");
}

function printSummary(adminEmail: string, agent1Email: string, agent2Email: string) {
  console.log("\nDone. Seed users (password: " + SEED_PASSWORD + "):");
  console.log("  Admin:", adminEmail);
  console.log("  Agent 1:", agent1Email);
  console.log("  Agent 2:", agent2Email);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
