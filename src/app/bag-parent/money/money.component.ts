import { Component, Input, OnInit } from '@angular/core';
import { CurrencyTransaction } from 'src/app/models/currencyTransaction';

@Component({
  selector: 'app-money',
  templateUrl: './money.component.html',
  styleUrls: ['./money.component.css']
})
export class MoneyComponent implements OnInit {
  @Input() currencyTransaction!: CurrencyTransaction;

  constructor() { }

  ngOnInit(): void {
  }



}
