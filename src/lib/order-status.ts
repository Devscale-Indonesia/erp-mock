export const ORDER_STATUSES = ['draft', 'confirmed', 'shipped', 'paid', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]
