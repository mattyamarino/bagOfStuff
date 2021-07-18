export class Item{
    id!: string;
    name!: string;
    type!: string;
    rarity!: string;
    description?: string;
    cost?: number;
    quantity?: number;
    owner!: string;
    lastUpdatedOn!: number;
    duplicateItems!: Item[];
}