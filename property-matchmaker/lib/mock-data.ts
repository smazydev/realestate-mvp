export const mockPropertySearchRows = [
  { id: "1", buyerName: "Etai + Niki", targetCities: ["Woodland Hills", "Tarzana"], targetNeighborhoods: ["West Hi", "Woodland Hills"], budgetMax: 1_600_000 },
  { id: "2", buyerName: "Josh Mehdian", targetCities: ["Brentwood", "Calabasas"], targetNeighborhoods: ["Culver C"], budgetMax: 4_000_000 },
  { id: "3", buyerName: "Sarah Chen", targetCities: ["Los Angeles"], targetNeighborhoods: ["-"], budgetMax: 1_200_000 },
  { id: "4", buyerName: "Mike Torres", targetCities: ["Woodland Hills", "West Hills"], targetNeighborhoods: ["West Hi"], budgetMax: 1_400_000 },
  { id: "5", buyerName: "Alex Kim", targetCities: ["Brentwood"], targetNeighborhoods: ["-"], budgetMax: 2_500_000 },
  { id: "6", buyerName: "Jordan Lee", targetCities: ["Calabasas", "Tarzana"], targetNeighborhoods: ["Woodland Hills", "Culver C"], budgetMax: 1_800_000 },
  { id: "7", buyerName: "Casey Brown", targetCities: ["Los Angeles"], targetNeighborhoods: ["-"], budgetMax: 950_000 },
  { id: "8", buyerName: "Riley Davis", targetCities: ["Woodland Hills"], targetNeighborhoods: ["West Hi", "Woodland Hills"], budgetMax: 1_100_000 },
  { id: "9", buyerName: "Morgan White", targetCities: ["Brentwood", "Los Angeles"], targetNeighborhoods: ["Culver C"], budgetMax: 3_200_000 },
  { id: "10", buyerName: "Taylor Green", targetCities: ["Tarzana", "Calabasas"], targetNeighborhoods: ["-"], budgetMax: 1_350_000 },
  { id: "11", buyerName: "Jamie Fox", targetCities: ["West Hills", "Woodland Hills"], targetNeighborhoods: ["West Hi"], budgetMax: 1_700_000 },
];

export const mockBuyerCards = [
  { id: "1", buyerName: "Etai + Niki", targetCities: ["Woodland Hills", "West Hills", "Tarzana"], budgetMax: 1_600_000, notes: "Updated with pool", agentEmail: "oranshevach@gmail.com" },
  { id: "2", buyerName: "Josh Mehdian", targetCities: ["Brentwood", "Culver City", "Calabasas", "Los Angeles"], budgetMax: 4_000_000, notes: "17k+ flat lot. House 3500 sq ft + South of Ventura only", agentEmail: "galmosherealtor@gmail.com" },
  { id: "3", buyerName: "Sarah Chen", targetCities: ["Los Angeles"], budgetMax: 1_200_000, notes: "Move in ready - room for 3+ cars", agentEmail: "sarah.chen@example.com" },
  { id: "4", buyerName: "Mike Torres", targetCities: ["Woodland Hills", "West Hills"], budgetMax: 1_400_000, notes: "Looking for a townhouse/condo 2+ bedrooms HOA less than $700/Month", agentEmail: "mike.torres@example.com" },
  { id: "5", buyerName: "Alex Kim", targetCities: ["Brentwood"], budgetMax: 2_500_000, notes: "", agentEmail: "alex.kim@example.com" },
  { id: "6", buyerName: "Jordan Lee", targetCities: ["Calabasas", "Tarzana"], budgetMax: 1_800_000, notes: "Prefer single story", agentEmail: "jordan.lee@example.com" },
];

export const mockSellerLeads = [
  { id: "1", propertyAddress: "5334 Baylor Pl. Woodland Hills", ownerName: "Sandy", assignedTo: "Oran Shevach", tags: ["Expired Listing", "Other"], city: "Woodland Hills", state: "CA", zip: "91367", source: "-", statusBadge: "Under Contract" as string | null },
  { id: "2", propertyAddress: "200 N Spring St, Los Angeles, CA 90012", ownerName: "-", assignedTo: "-", tags: [] as string[], city: "Los Angeles", state: "CA", zip: "90012", source: "-", statusBadge: null },
  { id: "3", propertyAddress: "1500 Ocean Ave, Santa Monica, CA 90401", ownerName: "Jane Doe", assignedTo: "Gal Moshe", tags: ["New Listing"], city: "Santa Monica", state: "CA", zip: "90401", source: "Zillow", statusBadge: null },
  { id: "4", propertyAddress: "8800 Sunset Blvd, West Hollywood, CA 90069", ownerName: "-", assignedTo: "-", tags: ["Expired Listing"], city: "West Hollywood", state: "CA", zip: "90069", source: "-", statusBadge: null },
  { id: "5", propertyAddress: "100 Universal City Plaza, Universal City, CA 91608", ownerName: "Universal", assignedTo: "Oran Shevach", tags: ["Other"], city: "Universal City", state: "CA", zip: "91608", source: "Referral", statusBadge: null },
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}
