export class User{
    id!: string;
    player!: string;
    character!: string;
    role!: string;
    short!: string;
    associatedPlayerCharacters?: User[];
}