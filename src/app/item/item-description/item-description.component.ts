import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';

@Component({
  selector: 'app-item-description',
  templateUrl: './item-description.component.html',
  styleUrls: ['./item-description.component.css']
})
export class ItemDescriptionComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ItemDescriptionComponent>, @Inject(MAT_DIALOG_DATA) public data: any, 
              public firestoreService: FirestoreService) { }

  ngOnInit(): void {
  }

  getItemIcon(type: string): string {
    return type.split(" ")[0].toLowerCase();
  }
}
