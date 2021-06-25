export class CurrencyTransaction{
    platinumDeposited!: number;
    electrumDeposited!: number;
    silverDeposited!: number;
    copperDeposited!: number;
    goldDeposited!: number;
    platinumTotal!: number;
    electrumTotal!: number;
    silverTotal!: number;
    copperTotal!: number;
    goldTotal!: number;
    description?: string;
    createdBy!: string;
    totalValueInSilver?: number;
}