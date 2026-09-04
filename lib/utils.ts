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
  platelets: 'Platelets',
  plasma: 'Plasma',
  cryoprecipitate: 'Cryoprecipitate',
};

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
