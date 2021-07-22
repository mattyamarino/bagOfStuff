export class ItemHistory {
    id!: string;
    itemId!: string;
    itemName!: string;
    itemRarity!: string
    action!: string;
    createdOn!: number;
    createdBy!: string;
    origin?: string;
    previousQuantity?: number;
    currentQuantity?: number;
    previousCost?: number;
    currentCost?: number;
    previousOwner?: string;
    currentOwner?: string;
}