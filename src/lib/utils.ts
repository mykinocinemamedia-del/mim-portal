/**
 * WhatsApp link generator and other utility helpers.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const COMPANY_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '60176635990'

/**
 * Generate a wa.me link with a pre-filled message.
 */
export function waLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

/**
 * Generate WhatsApp link to contact company admin.
 */
export function waCompanyLink(message: string): string {
  return waLink(COMPANY_WHATSAPP, message)
}

/**
 * Mask sensitive data (e.g., IC number) for display.
 */
export function maskIC(ic: string): string {
  if (!ic) return ''
  if (ic.length < 6) return ic
  return ic.slice(0, 6) + '******' + ic.slice(-4)
}

/**
 * Format currency in Malaysian Ringgit.
 */
export function formatMYR(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date in Malaysian format (DD/MM/YYYY).
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/**
 * Format date and time.
 */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Get initials from a name.
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Service types with labels.
 */
export const SERVICE_TYPES = [
  { value: 'maid', label: 'Pembantu Rumah', english: 'Personal Maid', salaryMin: 1500, salaryMax: 2500 },
  { value: 'babysitter', label: 'Pengasuh', english: 'Babysitter', salaryMin: 1500, salaryMax: 2500 },
  { value: 'caregiver', label: 'Penjaga Orang Tua', english: 'Adult Caretaker', salaryMin: 1700, salaryMax: 3500 },
] as const

export const SKILLS_OPTIONS = [
  { value: 'cooking', label: 'Memasak' },
  { value: 'baby_care', label: 'Menjaga bayi' },
  { value: 'child_care', label: 'Menjaga kanak-kanak' },
  { value: 'washing', label: 'Mencuci dan menggosok baju' },
  { value: 'cleaning', label: 'Membersihkan rumah' },
  { value: 'educating', label: 'Mendidik anak-anak' },
]

export const CHILD_AGE_RANGES = [
  { value: '0-6', label: '0 - 6 tahun' },
  { value: '12-17', label: '12 - 17 tahun' },
  { value: '18+', label: '18 tahun dan keatas' },
]

export const RELIGIONS = ['Islam', 'Kristian', 'Buddha', 'Hindu', 'Lain-lain']

export const MALAYSIAN_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Melaka',
  'Negeri Sembilan', 'Pahang', 'Perak', 'Perlis', 'Pulau Pinang',
  'Putrajaya', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu',
]

/**
 * Get service type label by value.
 */
export function getServiceLabel(value: string | null | undefined): string {
  if (!value) return '-'
  const t = SERVICE_TYPES.find((s) => s.value === value)
  return t ? t.label : value
}

/**
 * Get service salary range.
 */
export function getServiceSalaryRange(value: string | null | undefined): { min: number; max: number } | null {
  if (!value) return null
  const t = SERVICE_TYPES.find((s) => s.value === value)
  return t ? { min: t.salaryMin, max: t.salaryMax } : null
}
