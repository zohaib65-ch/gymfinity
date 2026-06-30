export interface User {
  id: string;
  name: string;
  username: string;
  role: "admin" | "receptionist";
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  features: string[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinsDate: string;
  status: "Active" | "Inactive" | "Expired";
  currentPlanId: string;
  currentPlanName: string;
  avatarUrl?: string;
  qrCode?: string;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  billingDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  status: "Paid" | "Partial" | "Pending";
  invoiceNumber: string;
  balance: number;
  planName: string;
}

export interface Attendance {
  id: string;
  memberId: string;
  memberName: string;
  checkInTime: string;
  checkOutTime?: string;
  date: string;
}

export interface Renewal {
  id: string;
  memberId: string;
  memberName: string;
  planId: string;
  planName: string;
  date: string;
  amount: number;
}

export const INITIAL_PLANS: Plan[] = [
  {
    id: "plan-silver",
    name: "Silver",
    price: 49,
    billingCycle: "Monthly",
    features: ["Access to Cardio & Weight area", "Free Locker use", "1 Session Gym Induction", "Open Hours Access"],
  },
  {
    id: "plan-gold",
    name: "Gold",
    price: 99,
    billingCycle: "Monthly",
    features: ["Access to all Gym Areas & Spa", "Sauna access", "All Group Fitness Classes", "1 Personal Trainer session/mo", "Locker & Towel service"],
  },
  {
    id: "plan-diamond",
    name: "Diamond",
    price: 149,
    billingCycle: "Monthly",
    features: ["VIP Full Access (All Locations)", "Unlimited Personal Training sessions", "Premium Spa & Cryotherapy", "Customized Nutrition Planner", "Free Guest Pass per visit", "Fresh Laundry service"],
  },
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: "mem-1",
    name: "Zohaib Chaudhry",
    email: "zohaib@example.com",
    phone: "(206) 555-0150",
    joinsDate: "2026-01-10",
    status: "Active",
    currentPlanId: "plan-diamond",
    currentPlanName: "Diamond",
    avatarUrl: "https://picsum.photos/seed/zohaib/120/120",
    qrCode: "GYMF-9F91-C93E",
  },
  {
    id: "mem-2",
    name: "Ayesha Malik",
    email: "ayesha.m@example.com",
    phone: "(206) 555-0188",
    joinsDate: "2026-03-15",
    status: "Active",
    currentPlanId: "plan-gold",
    currentPlanName: "Gold",
    avatarUrl: "https://picsum.photos/seed/ayesha/120/120",
    qrCode: "GYMF-883A-291B",
  },
  {
    id: "mem-3",
    name: "John Miller",
    email: "john.miller@example.com",
    phone: "(503) 555-0122",
    joinsDate: "2025-11-01",
    status: "Expired",
    currentPlanId: "plan-silver",
    currentPlanName: "Silver",
    avatarUrl: "https://picsum.photos/seed/john/120/120",
    qrCode: "GYMF-739C-011D",
  },
  {
    id: "mem-4",
    name: "Sophia Rodriguez",
    email: "sophia.rod@example.com",
    phone: "(415) 555-0199",
    joinsDate: "2026-05-20",
    status: "Active",
    currentPlanId: "plan-gold",
    currentPlanName: "Gold",
    avatarUrl: "https://picsum.photos/seed/sophia/120/120",
    qrCode: "GYMF-221F-930E",
  },
  {
    id: "mem-5",
    name: "James Anderson",
    email: "james.a@example.com",
    phone: "(617) 555-0134",
    joinsDate: "2026-04-05",
    status: "Inactive",
    currentPlanId: "plan-silver",
    currentPlanName: "Silver",
    avatarUrl: "https://picsum.photos/seed/james/120/120",
    qrCode: "GYMF-665D-221A",
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: "pay-1",
    memberId: "mem-1",
    memberName: "Zohaib Chaudhry",
    amount: 149,
    billingDate: "2026-06-10",
    paymentDate: "2026-06-10",
    paymentMethod: "Credit Card",
    status: "Paid",
    invoiceNumber: "INV-2026-1001",
    balance: 0,
    planName: "Diamond",
  },
  {
    id: "pay-2",
    memberId: "mem-2",
    memberName: "Ayesha Malik",
    amount: 99,
    billingDate: "2026-06-15",
    paymentDate: "2026-06-15",
    paymentMethod: "Apple Pay",
    status: "Paid",
    invoiceNumber: "INV-2026-1002",
    balance: 0,
    planName: "Gold",
  },
  {
    id: "pay-3",
    memberId: "mem-3",
    memberName: "John Miller",
    amount: 49,
    billingDate: "2026-06-01",
    status: "Pending",
    invoiceNumber: "INV-2026-1003",
    balance: 49,
    planName: "Silver",
  },
  {
    id: "pay-4",
    memberId: "mem-4",
    memberName: "Sophia Rodriguez",
    amount: 99,
    billingDate: "2026-05-20",
    paymentDate: "2026-05-21",
    paymentMethod: "Cash",
    status: "Paid",
    invoiceNumber: "INV-2026-1004",
    balance: 0,
    planName: "Gold",
  },
  {
    id: "pay-5",
    memberId: "mem-1",
    memberName: "Zohaib Chaudhry",
    amount: 149,
    billingDate: "2026-05-10",
    paymentDate: "2026-05-10",
    paymentMethod: "Credit Card",
    status: "Paid",
    invoiceNumber: "INV-2026-0988",
    balance: 0,
    planName: "Diamond",
  },
];

export const INITIAL_ATTENDANCE: Attendance[] = [
  {
    id: "att-1",
    memberId: "mem-1",
    memberName: "Zohaib Chaudhry",
    checkInTime: "08:15 AM",
    checkOutTime: "10:00 AM",
    date: "2026-06-30",
  },
  {
    id: "att-2",
    memberId: "mem-2",
    memberName: "Ayesha Malik",
    checkInTime: "09:30 AM",
    checkOutTime: "11:00 AM",
    date: "2026-06-30",
  },
  {
    id: "att-3",
    memberId: "mem-4",
    memberName: "Sophia Rodriguez",
    checkInTime: "10:45 AM",
    date: "2026-06-30",
  },
];

export const INITIAL_RENEWALS: Renewal[] = [
  {
    id: "ren-1",
    memberId: "mem-1",
    memberName: "Zohaib Chaudhry",
    planId: "plan-diamond",
    planName: "Diamond",
    date: "2026-06-10",
    amount: 149,
  },
  {
    id: "ren-2",
    memberId: "mem-2",
    memberName: "Ayesha Malik",
    planId: "plan-gold",
    planName: "Gold",
    date: "2026-06-15",
    amount: 99,
  },
];
