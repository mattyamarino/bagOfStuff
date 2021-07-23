import { Injectable } from '@angular/core';
import { User } from 'src/app/models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  sortUsersByNameAsscending(users: User[]): void {
    users.sort(function (y, x) {
      return y.character.toLowerCase().localeCompare(x.character.toLowerCase());
    });
  }

  getUserLabel(user: User): string {
    return user.character + " (" + user.player + ")";
  }
}
