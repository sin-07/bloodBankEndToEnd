import { BloodGroup } from '@/types';

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
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
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get urgency badge color
 */
export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'urgent':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-green-100 text-green-800';
  }
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'fulfilled':
    case 'completed':
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-blue-100 text-blue-800';
    case 'rejected':
    case 'cancelled':
    case 'expired':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Blood group options
 */
export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/**
 * Blood group colors for charts
 */
export const BLOOD_GROUP_COLORS: Record<string, string> = {
  'A+': '#EF4444',
  'A-': '#F97316',
  'B+': '#EAB308',
  'B-': '#22C55E',
  'AB+': '#3B82F6',
  'AB-': '#6366F1',
  'O+': '#EC4899',
  'O-': '#8B5CF6',
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
  return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
