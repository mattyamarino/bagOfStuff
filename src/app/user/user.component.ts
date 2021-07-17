import { Component, Input, OnInit } from '@angular/core';
import { User } from '../models/user';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  @Input() users!: User[];
  selectedUser?: User;

  constructor() { }

  ngOnInit(): void {
  }

  switchUser(): void {
    if(this.selectedUser) {
      this.selectedUser = undefined;
    }
  }

}
