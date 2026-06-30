import {
  Plan as OldPlan,
  Member,
  Payment as OldPayment,
  Attendance,
  Renewal as OldRenewal,
  INITIAL_PLANS,
  INITIAL_MEMBERS,
  INITIAL_PAYMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_RENEWALS,
} from "./initial-data";

export type { Member, Attendance } from "./initial-data";
export type { Plan, Payment, Renewal } from "./initial-data";

export interface User {
  id: string;
  name: string;
  username: string;
  role: "admin" | "receptionist";
  password: string;
}

function getStoredData<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading localStorage", error);
    return defaultValue;
  }
}

function setStoredData<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error writing localStorage", error);
  }
}

let isMongoDBConnected = false;

export function checkMongoDBConnection(): boolean {
  return isMongoDBConnected;
}

async function fetchCollection<T>(collectionName: string, fallbackData: T): Promise<T> {
  try {
    const response = await fetch(`/api/db?collection=${collectionName}`);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    isMongoDBConnected = true;
    setStoredData(`gym_${collectionName}`, data);
    return data as T;
  } catch (error) {
    console.warn(`MongoDB API fetch failed for '${collectionName}', falling back to localStorage:`, error);
    return getStoredData(`gym_${collectionName}`, fallbackData);
  }
}

async function saveCollection<T>(collectionName: string, data: T): Promise<void> {
  setStoredData(`gym_${collectionName}`, data);
  try {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection: collectionName, data }),
    });
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    isMongoDBConnected = true;
  } catch (error) {
    console.warn(`MongoDB API save failed for '${collectionName}', saved to localStorage fallback:`, error);
  }
}

export const getPlans = (): Promise<OldPlan[]> => fetchCollection<OldPlan[]>("plans", INITIAL_PLANS);
export const savePlans = (plans: OldPlan[]): Promise<void> => saveCollection<OldPlan[]>("plans", plans);
export const getMembers = (): Promise<Member[]> => fetchCollection<Member[]>("members", INITIAL_MEMBERS);
export const saveMembers = (members: Member[]): Promise<void> => saveCollection<Member[]>("members", members);
export const getPayments = (): Promise<OldPayment[]> => fetchCollection<OldPayment[]>("payments", INITIAL_PAYMENTS);
export const savePayments = (payments: OldPayment[]): Promise<void> => saveCollection<OldPayment[]>("payments", payments);
export const getAttendance = (): Promise<Attendance[]> => fetchCollection<Attendance[]>("attendance", INITIAL_ATTENDANCE);
export const saveAttendance = (att: Attendance[]): Promise<void> => saveCollection<Attendance[]>("attendance", att);
export const getRenewals = (): Promise<OldRenewal[]> => fetchCollection<OldRenewal[]>("renewals", INITIAL_RENEWALS);
export const saveRenewals = (ren: OldRenewal[]): Promise<void> => saveCollection<OldRenewal[]>("renewals", ren);

// --- dbService for API routes ---

const SERVICE_KEY = "gymfinity";

interface DbCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  dob: string;
  gender: string;
  emergencyContact: { name: string; phone: string };
  registrationDate: string;
  status: string;
  currentPlanId: string;
  currentPlanName: string;
  membershipStartDate: string;
  membershipEndDate: string;
  membershipId: string;
}

interface DbPlan {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  benefits: string[];
  isActive: boolean;
}

interface DbPayment {
  id: string;
  customerId: string;
  customerName: string;
  planId: string;
  planName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: "Paid" | "Partial" | "Pending";
  balance: number;
  createdBy: string;
}

interface DbRenewal {
  id: string;
  customerId: string;
  type: "Enrollment" | "Renewal";
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  date: string;
  amountPaid: number;
}

function getLocal<T>(key: string, fallback: T): T {
  return getStoredData(`${SERVICE_KEY}_${key}`, fallback);
}

function setLocal<T>(key: string, value: T): void {
  setStoredData(`${SERVICE_KEY}_${key}`, value);
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const INITIAL_USERS: User[] = [
  { id: "user-1", name: "Admin", username: "admin", role: "admin", password: "admin123" },
  { id: "user-2", name: "Zohaib Chaudhry", username: "zohaib", role: "admin", password: "zohaib123" },
];

const INITIAL_DB_CUSTOMERS: DbCustomer[] = [
  {
    id: "cust-1", name: "Zohaib Chaudhry", phone: "(206) 555-0150", email: "zohaib@example.com",
    address: "123 Main St", dob: "1990-01-15", gender: "Male",
    emergencyContact: { name: "Jane Chaudhry", phone: "(206) 555-0199" },
    registrationDate: "2026-01-10", status: "Active",
    currentPlanId: "plan-diamond", currentPlanName: "Diamond",
    membershipStartDate: "2026-01-10", membershipEndDate: "2027-01-10",
    membershipId: "GYMF-9F91-C93E",
  },
  {
    id: "cust-2", name: "Ayesha Malik", phone: "(206) 555-0188", email: "ayesha.m@example.com",
    address: "456 Oak Ave", dob: "1995-06-22", gender: "Female",
    emergencyContact: { name: "Kamran Malik", phone: "(206) 555-0189" },
    registrationDate: "2026-03-15", status: "Active",
    currentPlanId: "plan-gold", currentPlanName: "Gold",
    membershipStartDate: "2026-03-15", membershipEndDate: "2027-03-15",
    membershipId: "GYMF-883A-291B",
  },
  {
    id: "cust-3", name: "John Miller", phone: "(503) 555-0122", email: "john.miller@example.com",
    address: "789 Pine Rd", dob: "1988-11-05", gender: "Male",
    emergencyContact: { name: "Sarah Miller", phone: "(503) 555-0123" },
    registrationDate: "2025-11-01", status: "Expired",
    currentPlanId: "plan-silver", currentPlanName: "Silver",
    membershipStartDate: "2025-11-01", membershipEndDate: "2026-11-01",
    membershipId: "GYMF-739C-011D",
  },
  {
    id: "cust-4", name: "Sophia Rodriguez", phone: "(415) 555-0199", email: "sophia.rod@example.com",
    address: "321 Bay St", dob: "1992-03-12", gender: "Female",
    emergencyContact: { name: "Carlos Rodriguez", phone: "(415) 555-0200" },
    registrationDate: "2026-05-20", status: "Active",
    currentPlanId: "plan-gold", currentPlanName: "Gold",
    membershipStartDate: "2026-05-20", membershipEndDate: "2027-05-20",
    membershipId: "GYMF-221F-930E",
  },
  {
    id: "cust-5", name: "James Anderson", phone: "(617) 555-0134", email: "james.a@example.com",
    address: "654 Elm St", dob: "1985-09-30", gender: "Male",
    emergencyContact: { name: "Lisa Anderson", phone: "(617) 555-0135" },
    registrationDate: "2026-04-05", status: "Inactive",
    currentPlanId: "plan-silver", currentPlanName: "Silver",
    membershipStartDate: "2026-04-05", membershipEndDate: "2027-04-05",
    membershipId: "GYMF-665D-221A",
  },
];

const INITIAL_DB_PLANS: DbPlan[] = [
  { id: "plan-silver", name: "Silver", duration: 12, price: 49, description: "Basic membership with essential access", benefits: ["Access to Cardio & Weight area", "Free Locker use", "1 Session Gym Induction", "Open Hours Access"], isActive: true },
  { id: "plan-gold", name: "Gold", duration: 12, price: 99, description: "Premium membership with spa & classes", benefits: ["Access to all Gym Areas & Spa", "Sauna access", "All Group Fitness Classes", "1 Personal Trainer session/mo", "Locker & Towel service"], isActive: true },
  { id: "plan-diamond", name: "Diamond", duration: 12, price: 149, description: "VIP all-access membership", benefits: ["VIP Full Access (All Locations)", "Unlimited Personal Training sessions", "Premium Spa & Cryotherapy", "Customized Nutrition Planner", "Free Guest Pass per visit", "Fresh Laundry service"], isActive: true },
];

const INITIAL_DB_PAYMENTS: DbPayment[] = [
  { id: "pay-1", customerId: "cust-1", customerName: "Zohaib Chaudhry", planId: "plan-diamond", planName: "Diamond", amount: 149, paymentDate: "2026-06-10", paymentMethod: "Credit Card", status: "Paid", balance: 0, createdBy: "Staff" },
  { id: "pay-2", customerId: "cust-2", customerName: "Ayesha Malik", planId: "plan-gold", planName: "Gold", amount: 99, paymentDate: "2026-06-15", paymentMethod: "Apple Pay", status: "Paid", balance: 0, createdBy: "Staff" },
  { id: "pay-3", customerId: "cust-3", customerName: "John Miller", planId: "plan-silver", planName: "Silver", amount: 49, paymentDate: "2026-06-01", paymentMethod: "Cash", status: "Pending", balance: 49, createdBy: "Staff" },
  { id: "pay-4", customerId: "cust-4", customerName: "Sophia Rodriguez", planId: "plan-gold", planName: "Gold", amount: 99, paymentDate: "2026-05-21", paymentMethod: "Cash", status: "Paid", balance: 0, createdBy: "Staff" },
  { id: "pay-5", customerId: "cust-1", customerName: "Zohaib Chaudhry", planId: "plan-diamond", planName: "Diamond", amount: 149, paymentDate: "2026-05-10", paymentMethod: "Credit Card", status: "Paid", balance: 0, createdBy: "Staff" },
];

const INITIAL_DB_RENEWALS: DbRenewal[] = [
  { id: "ren-1", customerId: "cust-1", type: "Enrollment", planId: "plan-diamond", planName: "Diamond", startDate: "2026-01-10", endDate: "2027-01-10", date: "2026-01-10", amountPaid: 149 },
  { id: "ren-2", customerId: "cust-2", type: "Enrollment", planId: "plan-gold", planName: "Gold", startDate: "2026-03-15", endDate: "2027-03-15", date: "2026-03-15", amountPaid: 99 },
];

function initData(): void {
  if (!getLocal("_initialized", false)) {
    setLocal("users", INITIAL_USERS);
    setLocal("customers", INITIAL_DB_CUSTOMERS);
    setLocal("plans", INITIAL_DB_PLANS);
    setLocal("payments", INITIAL_DB_PAYMENTS);
    setLocal("renewals", INITIAL_DB_RENEWALS);
    setLocal("_initialized", true);
  }
}

initData();

export const dbService = {
  // Users
  findUserByUsername(username: string): User | undefined {
    return getLocal<User[]>("users", []).find((u) => u.username === username);
  },

  // Customers
  async getCustomers(): Promise<DbCustomer[]> {
    return getLocal<DbCustomer[]>("customers", []);
  },

  async getCustomerById(id: string): Promise<DbCustomer | undefined> {
    return getLocal<DbCustomer[]>("customers", []).find((c) => c.id === id);
  },

  async createCustomer(data: Omit<DbCustomer, "id" | "membershipId">): Promise<DbCustomer> {
    const customers = getLocal<DbCustomer[]>("customers", []);
    const newCustomer: DbCustomer = {
      ...data,
      id: generateId("cust"),
      membershipId: `GYMF-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    };
    customers.push(newCustomer);
    setLocal("customers", customers);
    return newCustomer;
  },

  async updateCustomer(id: string, data: Partial<DbCustomer>): Promise<DbCustomer | undefined> {
    const customers = getLocal<DbCustomer[]>("customers", []);
    const idx = customers.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    customers[idx] = { ...customers[idx], ...data };
    setLocal("customers", customers);
    return customers[idx];
  },

  async deleteCustomer(id: string): Promise<boolean> {
    const customers = getLocal<DbCustomer[]>("customers", []);
    const filtered = customers.filter((c) => c.id !== id);
    if (filtered.length === customers.length) return false;
    setLocal("customers", filtered);
    return true;
  },

  // Plans
  async getPlans(): Promise<DbPlan[]> {
    return getLocal<DbPlan[]>("plans", []);
  },

  async getPlanById(id: string): Promise<DbPlan | undefined> {
    return getLocal<DbPlan[]>("plans", []).find((p) => p.id === id);
  },

  async createPlan(data: Omit<DbPlan, "id">): Promise<DbPlan> {
    const plans = getLocal<DbPlan[]>("plans", []);
    const newPlan: DbPlan = { ...data, id: generateId("plan") };
    plans.push(newPlan);
    setLocal("plans", plans);
    return newPlan;
  },

  async updatePlan(id: string, data: Partial<DbPlan>): Promise<DbPlan | undefined> {
    const plans = getLocal<DbPlan[]>("plans", []);
    const idx = plans.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    plans[idx] = { ...plans[idx], ...data };
    setLocal("plans", plans);
    return plans[idx];
  },

  async deletePlan(id: string): Promise<boolean> {
    const plans = getLocal<DbPlan[]>("plans", []);
    const filtered = plans.filter((p) => p.id !== id);
    if (filtered.length === plans.length) return false;
    setLocal("plans", filtered);
    return true;
  },

  // Payments
  async getPayments(): Promise<DbPayment[]> {
    return getLocal<DbPayment[]>("payments", []);
  },

  async createPayment(data: Omit<DbPayment, "id">): Promise<DbPayment> {
    const payments = getLocal<DbPayment[]>("payments", []);
    const newPayment: DbPayment = { ...data, id: generateId("pay") };
    payments.push(newPayment);
    setLocal("payments", payments);
    return newPayment;
  },

  async updatePayment(id: string, data: Partial<DbPayment>): Promise<DbPayment | undefined> {
    const payments = getLocal<DbPayment[]>("payments", []);
    const idx = payments.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    payments[idx] = { ...payments[idx], ...data };
    setLocal("payments", payments);
    return payments[idx];
  },

  // Renewals
  async getRenewals(): Promise<DbRenewal[]> {
    return getLocal<DbRenewal[]>("renewals", []);
  },

  async createRenewal(data: Omit<DbRenewal, "id">): Promise<DbRenewal> {
    const renewals = getLocal<DbRenewal[]>("renewals", []);
    const newRenewal: DbRenewal = { ...data, id: generateId("ren") };
    renewals.push(newRenewal);
    setLocal("renewals", renewals);
    return newRenewal;
  },

  isUsingRealMongo(): boolean {
    return isMongoDBConnected;
  },
};
