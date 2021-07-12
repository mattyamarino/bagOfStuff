import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ExternalItem } from 'src/app/models/ExternalItem';

@Component({
  selector: 'app-item-transaction-modal',
  templateUrl: './item-transaction-modal.component.html',
  styleUrls: ['./item-transaction-modal.component.css']
})
export class ItemTransactionModalComponent implements OnInit {
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  externalItems: ExternalItem[] = [];

  constructor() { }

  ngOnInit(): void {
    this.firstFormGroup = new FormGroup({
      firstCtrl: new FormControl(''),
      isNewItem: new FormControl(true)
    }); 
    this.secondFormGroup = new FormGroup({
      secondCtrl: new FormControl('', Validators.required)
    }); 
  }

}
