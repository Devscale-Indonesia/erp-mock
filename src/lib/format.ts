const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const compact = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatIDR(amount: number) {
  return idr.format(amount)
}

export function formatCompactIDR(amount: number) {
  return `Rp ${compact.format(amount)}`
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

// Stored dates are ISO strings (YYYY-MM-DD); parse as local to avoid timezone shifts.
export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function todayIso() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

export function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Something went wrong'
}
