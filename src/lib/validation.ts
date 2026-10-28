export function requireText(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${field} is required`)
  }
  return value.trim()
}

export function requireInt(value: unknown, field: string, min = 0) {
  const n = Number(value)
  if (!Number.isInteger(n) || n < min) {
    throw new Error(`${field} must be an integer >= ${min}`)
  }
  return n
}

// Turns SQLite unique-constraint failures into readable messages for the UI.
export function withUniqueCheck<T>(write: () => T): T {
  try {
    return write()
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('UNIQUE constraint failed')) {
      const column = err.message.split('.').pop() ?? 'value'
      throw new Error(`A record with this ${column} already exists`)
    }
    throw err
  }
}
