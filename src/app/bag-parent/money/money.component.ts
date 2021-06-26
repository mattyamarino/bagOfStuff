import { Component, Input, OnInit } from '@angular/core';
import { MonetaryTransaction } from 'src/app/models/MonetaryTransaction';

@Component({
  selector: 'app-money',
  templateUrl: './money.component.html',
  styleUrls: ['./money.component.css']
})
export class MoneyComponent implements OnInit {
  @Input() currencyTransaction!: MonetaryTransaction;

  constructor() { }

  ngOnInit(): void {
  }



}
