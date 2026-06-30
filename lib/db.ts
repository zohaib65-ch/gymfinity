import {
  Plan,
  Member,
  Payment,
  Attendance,
  Renewal,
  INITIAL_PLANS,
  INITIAL_MEMBERS,
  INITIAL_PAYMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_RENEWALS,
} from "./initial-data";

export type { User, Plan, Member, Payment, Attendance, Renewal } from "./initial-data";

// Fallback helper to interact with LocalStorage
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

// Check if we are connected to the API / MongoDB
let isMongoDBConnected = false;

export function checkMongoDBConnection(): boolean {
  return isMongoDBConnected;
}

// General function to fetch a collection
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
    // Keep local cache in sync for offline/fallback use
    setStoredData(`gym_${collectionName}`, data);
    return data as T;
  } catch (error) {
    console.warn(`MongoDB API fetch failed for '${collectionName}', falling back to localStorage:`, error);
    // If MongoDB URI is not set or network fails, fall back to local storage
    return getStoredData(`gym_${collectionName}`, fallbackData);
  }
}

// General function to save a collection
async function saveCollection<T>(collectionName: string, data: T): Promise<void> {
  // Always update local storage first so user has instant feedback
  setStoredData(`gym_${collectionName}`, data);

  try {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection: collectionName,
        data: data,
      }),
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

// Exported async DB API
export const getPlans = (): Promise<Plan[]> => fetchCollection<Plan[]>("plans", INITIAL_PLANS);
export const savePlans = (plans: Plan[]): Promise<void> => saveCollection<Plan[]>("plans", plans);

export const getMembers = (): Promise<Member[]> => fetchCollection<Member[]>("members", INITIAL_MEMBERS);
export const saveMembers = (members: Member[]): Promise<void> => saveCollection<Member[]>("members", members);

export const getPayments = (): Promise<Payment[]> => fetchCollection<Payment[]>("payments", INITIAL_PAYMENTS);
export const savePayments = (payments: Payment[]): Promise<void> => saveCollection<Payment[]>("payments", payments);

export const getAttendance = (): Promise<Attendance[]> => fetchCollection<Attendance[]>("attendance", INITIAL_ATTENDANCE);
export const saveAttendance = (att: Attendance[]): Promise<void> => saveCollection<Attendance[]>("attendance", att);

export const getRenewals = (): Promise<Renewal[]> => fetchCollection<Renewal[]>("renewals", INITIAL_RENEWALS);
export const saveRenewals = (ren: Renewal[]): Promise<void> => saveCollection<Renewal[]>("renewals", ren);
