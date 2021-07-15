export class ExternalItem {
    name!: string;
    type!: string;
    desc!: string;
    rarity!: string;
    requires_attunement?: string;
    level_int?: number;
    category?: string;
    damage_dice?: string;
    damage_type?: string;
    cost?: string;
    school?: string;
    range?: string;
    duration?: string;
    casting_time?: string;
    properties?: string[];
}