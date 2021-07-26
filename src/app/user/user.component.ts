import { Component, Input, OnInit } from '@angular/core';
import { User } from '../models/user';
import { FirestoreService } from '../services/firestore/firestore.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  @Input() users!: User[];
  selectedUser?: User;

  constructor(private firestoreService: FirestoreService) { }

  ngOnInit(): void {
  }

  updateUser(user: User): void {
    this.setAssociatedPlayerCharacters(user);
    this.updateLastLogin(user);
  }

  setAssociatedPlayerCharacters(user: User): void {
    this.selectedUser!.associatedPlayerCharacters = user.role === "dm" ? this.users : undefined;
  }

  updateLastLogin(user: User): void {
    this.firestoreService.updateUserLastLogin(user.id);
  }

  switchUser(): void {
    if(this.selectedUser) {
      this.selectedUser = undefined;
    }
  }
}
