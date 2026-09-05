import { BloodGroup } from '@/types';
export type { BloodGroup };

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get urgency badge styling classes (high contrast clinical styling)
 */
export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'critical':
      return 'bg-rose-50 text-rose-700 border border-rose-200 font-medium';
    case 'urgent':
      return 'bg-amber-50 text-amber-800 border border-amber-200 font-medium';
    default:
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium';
  }
}

/**
 * Get status badge styling classes (high contrast clinical styling)
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'fulfilled':
    case 'completed':
    case 'available':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium';
    case 'pending':
      return 'bg-amber-50 text-amber-800 border border-amber-200 font-medium';
    case 'approved':
      return 'bg-sky-50 text-sky-700 border border-sky-200 font-medium';
    case 'rejected':
    case 'cancelled':
    case 'expired':
    case 'discarded':
      return 'bg-rose-50 text-rose-700 border border-rose-200 font-medium';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200 font-medium';
  }
}

export function getUrgencyVariant(urgency: string): 'danger' | 'warning' | 'success' | 'default' {
  switch (urgency) {
    case 'critical':
      return 'danger';
    case 'urgent':
      return 'warning';
    default:
      return 'success';
  }
}

export function getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'danger' | 'default' {
  switch (status) {
    case 'fulfilled':
    case 'completed':
    case 'available':
      return 'success';
    case 'pending':
      return 'warning';
    case 'approved':
      return 'info';
    case 'rejected':
    case 'cancelled':
    case 'expired':
    case 'discarded':
      return 'danger';
    default:
      return 'default';
  }
}

/**
 * Blood group options
 */
export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/**
 * High-precision blood compatibility matrix
 */
export const BLOOD_COMPATIBILITY: Record<
  BloodGroup,
  {
    give: BloodGroup[];
    receive: BloodGroup[];
    title: string;
    description: string;
  }
> = {
  'O-': {
    give: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    receive: ['O-'],
    title: 'Universal Red Blood Cell Donor',
    description: 'Can be given to patients of any blood group. Highly vital in emergency trauma care.',
  },
  'O+': {
    give: ['O+', 'A+', 'B+', 'AB+'],
    receive: ['O+', 'O-'],
    title: 'Most Common Blood Type',
    description: 'Can donate to any positive blood group. Present in nearly 38% of patients.',
  },
  'A-': {
    give: ['A-', 'A+', 'AB-', 'AB+'],
    receive: ['A-', 'O-'],
    title: 'Valuable Platelet & RBC Donor',
    description: 'Can donate red blood cells to A and AB blood types regardless of Rh factor.',
  },
  'A+': {
    give: ['A+', 'AB+'],
    receive: ['A+', 'A-', 'O+', 'O-'],
    title: 'High-Demand Blood Group',
    description: 'Second most common blood group. Vital for routine surgeries and cancer treatments.',
  },
  'B-': {
    give: ['B-', 'B+', 'AB-', 'AB+'],
    receive: ['B-', 'O-'],
    title: 'Rare Blood Group',
    description: 'Only 2% of the population has B-. Critical for specialized transfusions.',
  },
  'B+': {
    give: ['B+', 'AB+'],
    receive: ['B+', 'B-', 'O+', 'O-'],
    title: 'Major Positive Group',
    description: 'Can give to B+ and AB+ recipients. High demand in regional medical centers.',
  },
  'AB-': {
    give: ['AB-', 'AB+'],
    receive: ['AB-', 'A-', 'B-', 'O-'],
    title: 'Rarest Blood Group',
    description: 'The rarest blood type (less than 1%). Universal plasma donor.',
  },
  'AB+': {
    give: ['AB+'],
    receive: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    title: 'Universal Red Blood Cell Recipient',
    description: 'Can receive red blood cells from any blood type. Universal plasma donor.',
  },
};

/**
 * Blood group chart colors
 */
export const BLOOD_GROUP_COLORS: Record<string, string> = {
  'A+': '#f43f5e',
  'A-': '#fb7185',
  'B+': '#f59e0b',
  'B-': '#fbbf24',
  'AB+': '#8b5cf6',
  'AB-': '#a78bfa',
  'O+': '#10b981',
  'O-': '#06b6d4',
};

/**
 * Component display names
 */
export const COMPONENT_NAMES: Record<string, string> = {
  whole_blood: 'Whole Blood',
  packed_rbc: 'Packed RBC',
  platelets: 'Platelets (SDP / RDP)',
  plasma: 'Fresh Frozen Plasma (FFP)',
  cryoprecipitate: 'Cryoprecipitate',
};

/**
 * Detailed clinical specifications for all fractionated components
 */
export interface ComponentDetail {
  id: string;
  name: string;
  shortName: string;
  subtitle: string;
  storageTemp: string;
  shelfLife: string;
  shelfLifeDays: number;
  donationIntervalDays: number;
  maxDonationsPerYear: number;
  clinicalUses: string[];
  volumePerUnit: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  themeColor: string;
  urgentNotice?: string;
  universalDonorType?: string;
}

export const COMPONENT_DETAILS: Record<string, ComponentDetail> = {
  platelets: {
    id: 'platelets',
    name: 'Platelets (Single Donor Platelets - SDP)',
    shortName: 'Platelets',
    subtitle: 'Thrombocyte cell fragments crucial for clot formation & bleeding arrest',
    storageTemp: '20°C to 24°C (Continuous horizontal agitation)',
    shelfLife: '5 Days maximum',
    shelfLifeDays: 5,
    donationIntervalDays: 15,
    maxDonationsPerYear: 24,
    clinicalUses: [
      'Dengue & acute viral thrombocytopenia',
      'Leukemia & chemotherapy-induced bone marrow suppression',
      'Bone marrow & organ transplants',
      'Major surgical & trauma hemorrhages',
    ],
    volumePerUnit: '250 - 300 ml (Equivalent to 6-8 random units)',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-800',
    themeColor: '#f59e0b',
    urgentNotice: 'Ultra-perishable: 5-day lifespan requires continuous rolling replenishment.',
    universalDonorType: 'AB+ / AB- (or group-specific matching)',
  },
  plasma: {
    id: 'plasma',
    name: 'Fresh Frozen Plasma (FFP)',
    shortName: 'Plasma',
    subtitle: 'Liquid portion of blood carrying proteins, clotting factors & antibodies',
    storageTemp: '-18°C or colder (Deep Cryogenic Freeze)',
    shelfLife: '1 Year (365 Days)',
    shelfLifeDays: 365,
    donationIntervalDays: 28,
    maxDonationsPerYear: 12,
    clinicalUses: [
      'Severe burn victims & extensive fluid loss',
      'Trauma coagulopathy & massive transfusions',
      'Liver failure & cirrhosis clotting factor replenishment',
      'Warfarin overdose & immediate anticoagulation reversal',
    ],
    volumePerUnit: '200 - 250 ml per pack',
    badgeBg: 'bg-sky-50',
    badgeBorder: 'border-sky-200',
    badgeText: 'text-sky-800',
    themeColor: '#0284c7',
    urgentNotice: 'AB Positive & Negative are the prized Universal Plasma Donors.',
    universalDonorType: 'AB+ / AB- (Universal Plasma Donor)',
  },
  whole_blood: {
    id: 'whole_blood',
    name: 'Whole Blood',
    shortName: 'Whole Blood',
    subtitle: 'Unseparated blood containing red cells, white cells, platelets, and plasma',
    storageTemp: '2°C to 6°C (Refrigerated)',
    shelfLife: '35 - 42 Days',
    shelfLifeDays: 42,
    donationIntervalDays: 90,
    maxDonationsPerYear: 4,
    clinicalUses: [
      'Acute hemorrhagic trauma & roadside accidents',
      'Massive intraoperative blood loss',
      'Fractionation into RBC, Plasma, and Cryoprecipitate',
    ],
    volumePerUnit: '350 ml or 450 ml',
    badgeBg: 'bg-rose-50',
    badgeBorder: 'border-rose-200',
    badgeText: 'text-rose-800',
    themeColor: '#e11d48',
    urgentNotice: 'Fractionated into 3 components to save up to 3 lives per unit.',
    universalDonorType: 'O- (Universal Red Cell Donor)',
  },
  packed_rbc: {
    id: 'packed_rbc',
    name: 'Packed Red Blood Cells (PRBC)',
    shortName: 'Packed RBC',
    subtitle: 'Concentrated erythrocytes for rapid oxygen-carrying capacity',
    storageTemp: '2°C to 6°C (Refrigerated)',
    shelfLife: '42 Days with SAGM anticoagulant',
    shelfLifeDays: 42,
    donationIntervalDays: 90,
    maxDonationsPerYear: 4,
    clinicalUses: [
      'Severe chronic anemia & hemoglobin deficiency',
      'Thalassemia major & Sickle Cell disease',
      'Cardiac & orthopedic surgeries',
    ],
    volumePerUnit: '220 - 300 ml',
    badgeBg: 'bg-red-50',
    badgeBorder: 'border-red-200',
    badgeText: 'text-red-800',
    themeColor: '#dc2626',
    universalDonorType: 'O- (Universal RBC Donor)',
  },
  cryoprecipitate: {
    id: 'cryoprecipitate',
    name: 'Cryoprecipitate (Cryo)',
    shortName: 'Cryoprecipitate',
    subtitle: 'Insoluble precipitate rich in Factor VIII, Fibrinogen, and von Willebrand factor',
    storageTemp: '-18°C or colder',
    shelfLife: '1 Year (365 Days)',
    shelfLifeDays: 365,
    donationIntervalDays: 28,
    maxDonationsPerYear: 12,
    clinicalUses: [
      'Hemophilia A & von Willebrand disease',
      'Hypofibrinogenemia & massive obstetric hemorrhage',
      'Disseminated Intravascular Coagulation (DIC)',
    ],
    volumePerUnit: '15 - 20 ml per unit',
    badgeBg: 'bg-indigo-50',
    badgeBorder: 'border-indigo-200',
    badgeText: 'text-indigo-800',
    themeColor: '#4f46e5',
    universalDonorType: 'AB+ / AB- preferred',
  },
};

/**
 * Plasma Compatibility Matrix
 * In plasma transfusion, AB is the Universal Donor (plasma contains no anti-A or anti-B antibodies)
 * and O is the Universal Recipient.
 */
export const PLASMA_COMPATIBILITY: Record<
  BloodGroup,
  {
    give: BloodGroup[];
    receive: BloodGroup[];
    title: string;
    description: string;
  }
> = {
  'AB+': {
    give: ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
    receive: ['AB+', 'AB-'],
    title: 'Universal Plasma Donor',
    description: 'AB plasma lacks anti-A and anti-B antibodies, making it universally safe for ALL patients in emergency burns, trauma, and neonatal care.',
  },
  'AB-': {
    give: ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
    receive: ['AB+', 'AB-'],
    title: 'Universal Plasma Donor',
    description: 'AB- plasma is prized in pediatric and emergency transfusions because it can be safely infused into any patient regardless of recipient blood type.',
  },
  'A+': {
    give: ['A+', 'A-', 'O+', 'O-'],
    receive: ['A+', 'A-', 'AB+', 'AB-'],
    title: 'A-Group Plasma Donor',
    description: 'Contains only anti-B antibodies. Compatible with Type A and Type O plasma recipients.',
  },
  'A-': {
    give: ['A+', 'A-', 'O+', 'O-'],
    receive: ['A+', 'A-', 'AB+', 'AB-'],
    title: 'A-Group Plasma Donor',
    description: 'Can donate plasma safely to patients with blood groups A and O.',
  },
  'B+': {
    give: ['B+', 'B-', 'O+', 'O-'],
    receive: ['B+', 'B-', 'AB+', 'AB-'],
    title: 'B-Group Plasma Donor',
    description: 'Contains only anti-A antibodies. Compatible with Type B and Type O plasma recipients.',
  },
  'B-': {
    give: ['B+', 'B-', 'O+', 'O-'],
    receive: ['B+', 'B-', 'AB+', 'AB-'],
    title: 'B-Group Plasma Donor',
    description: 'Can donate plasma safely to patients with blood groups B and O.',
  },
  'O+': {
    give: ['O+', 'O-'],
    receive: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    title: 'Universal Plasma Recipient',
    description: 'O+ plasma contains both anti-A and anti-B antibodies, so it can only be given to O patients, but O patients can receive plasma from any group.',
  },
  'O-': {
    give: ['O+', 'O-'],
    receive: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    title: 'Universal Plasma Recipient',
    description: 'While O- is universal for red cells, for plasma O- can receive plasma safely from all groups.',
  },
};

/**
 * Get styling class for component badges
 */
export function getComponentBadgeClass(component: string): string {
  switch (component) {
    case 'platelets':
      return 'bg-amber-50 text-amber-800 border border-amber-200 font-bold';
    case 'plasma':
      return 'bg-sky-50 text-sky-800 border border-sky-200 font-bold';
    case 'packed_rbc':
      return 'bg-red-50 text-red-800 border border-red-200 font-bold';
    case 'cryoprecipitate':
      return 'bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold';
    default:
      return 'bg-rose-50 text-rose-800 border border-rose-200 font-bold';
  }
}

/**
 * Download file from blob
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number = 50): string {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

