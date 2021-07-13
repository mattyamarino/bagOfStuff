export class ItemConstants {
    public static scrollStatsMap: Map<number, ScrollStatistic> = new Map([
        [0, {rarity: "common", DC: 13, attackBonus: 5}],
        [1, {rarity: "common", DC: 13, attackBonus: 5}],
        [2, {rarity: "uncommon", DC: 13, attackBonus: 5}],
        [3, {rarity: "uncommon", DC: 15, attackBonus: 7}],
        [4, {rarity: "rare", DC: 15, attackBonus: 7}],
        [5, {rarity: "rare", DC: 17, attackBonus: 9}],
        [6, {rarity: "very rare", DC: 17, attackBonus: 9}],
        [7, {rarity: "very rare", DC: 18, attackBonus: 10}],
        [8, {rarity: "very rare", DC: 18, attackBonus: 10}],
        [9, {rarity: "legendary", DC: 19, attackBonus: 11}],
    ]);

    public static itemTypes: string[] = [
        "adventuring gear",
        "armor",
        "gemstone",
        "potion",
        "ring",
        "rod",
        "scroll",
        "staff",
        "wand",
        "weapon"
      ];
}

export class ScrollStatistic {
    rarity!: string;
    DC!: number;
    attackBonus!: number;
}