export class ItemHistory {
    id!: string;
    itemId!: string;
    action!: string;
    createdOn!: number;
    createdBy!: string;
    origin?: string;
    transactionQuantity?: string;
    currentQuantity?: string;
    previousCost?: number;
    currentCost?: number;
    previousOwner?: string;
    currentOwner?: string;
}