import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ScrollConstants } from 'src/app/config/ScrollConstants';
import { ExternalItem } from 'src/app/models/ExternalItem';
import { ExternalOpen5EResponse } from 'src/app/models/ExternalOpen5EResponse';
import { Item } from 'src/app/models/Item';
import { HttpService } from 'src/app/services/http/http.service';

@Component({
  selector: 'app-item-transaction-modal',
  templateUrl: './item-transaction-modal.component.html',
  styleUrls: ['./item-transaction-modal.component.css']
})
export class ItemTransactionModalComponent implements OnInit {
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  externalItems: ExternalItem[] = [];
  itemToCreate: Item = new Item;

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    this.firstFormGroup = new FormGroup({
      isNewItem: new FormControl(true),
      firstCtrl: new FormControl('')
    });
    this.secondFormGroup = new FormGroup({
      secondCtrl: new FormControl('', Validators.required)
    });

    this.isValidatorsRequiredFirstCtrl();
  }

  isValidatorsRequiredFirstCtrl(): void {
    this.firstFormGroup.get('isNewItem')?.valueChanges.subscribe(val => {
      if (val == false) {
        this.firstFormGroup.controls['firstCtrl'].setValidators([Validators.required]);
      } else {
        this.firstFormGroup.controls['firstCtrl'].clearValidators();
      }
      this.firstFormGroup.controls['firstCtrl'].updateValueAndValidity();
    });
  }

  getPregeneratedItem(event: any) {
    const query: string = this.firstFormGroup.get("firstCtrl")?.value.toLowerCase();
    if(query.indexOf("scroll of") !== -1) {
      this.getScrolls(query);
    } else if(query.length > 3 && (this.externalItems.length == 0 || event.key === 'Backspace')) {
      this.getMagicItems(query);
    } else {
      if(query.length <= 3) {
        this.externalItems = [];
      }
      this.filterExternalItems(query);
    }
  }

  getMagicItems(query: string): void {
    let weapons = this.httpService.getWeapons(query)
    let magicItems = this.httpService.getMagicItems(query)

    forkJoin([weapons, magicItems]).subscribe(res => {
      const resWeapons: ExternalOpen5EResponse = res[0];
      resWeapons.results.forEach(weapon => {
        weapon.type = "weapon";
        weapon.rarity = "common";
        weapon.desc = weapon.category + " ---" + weapon.damage_dice + " " + weapon.damage_type;
        weapon.cost = weapon.cost!.replace(/[^\d.-]/g, '');
      });
      const resMagicItems: ExternalOpen5EResponse = res[1];
      this.externalItems = resWeapons.results.concat(resMagicItems.results)
      console.log(this.externalItems)
    });
  }

  getScrolls(query: string): void {
    const rawQuery = query.split(" ");
    if(rawQuery.length == 3) {
      this.httpService.getScrolls(rawQuery[2]).subscribe(res => {
        const items: ExternalOpen5EResponse = res;
        items.results.forEach(item => {
          item.type = "scroll"
          item.name = "Scroll Of " + item.name; 
          item.rarity = ScrollConstants.scrollStatsMap.get(item.level_int!)?.rarity!;
          item.desc = "--- Spell Scroll with (if applicable) Save DC of " + ScrollConstants.scrollStatsMap.get(item.level_int!)?.DC! + 
          " and an Atk Bonus of +" + ScrollConstants.scrollStatsMap.get(item.level_int!)?.attackBonus! + " --- " + item.desc;
        });
        this.externalItems = items.results;
      });
    }
  }

  filterExternalItems(query: string): void {
    let filteredArray: ExternalItem[] = [];
    this.externalItems.forEach(item => {
      if (item.name.toLowerCase().indexOf(query) !== -1) {
        filteredArray.push(item);
      }
    });
    this.externalItems = filteredArray;
  }

  selectItem(itemName: string): void {
    const externalItem = this.externalItems.find(function (element) {
      return element.name === itemName;
    });
    this.itemToCreate.cost = externalItem!.cost ? Number(externalItem!.cost!) : 0 
    this.itemToCreate.description = externalItem!.desc;
    this.itemToCreate.name = externalItem!.name;
    this.itemToCreate.rarity = externalItem!.rarity;
    this.itemToCreate.type = externalItem!.type;
  }
}