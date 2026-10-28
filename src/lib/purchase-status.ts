export const PURCHASE_STATUSES = ['draft', 'ordered', 'received', 'cancelled'] as const
export type PurchaseStatus = (typeof PURCHASE_STATUSES)[number]
