import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ItemConstants } from 'src/app/config/ItemConstants';
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
  itemTypes: string[] = ItemConstants.itemTypes;
  rarityTypes: string[] = ItemConstants.rarityTypes;

  constructor(private httpService: HttpService, public titleCasePipe: TitleCasePipe) { }

  ngOnInit(): void {
    this.firstFormGroup = new FormGroup({
      isNewItem: new FormControl(true),
      itemName: new FormControl('')
    });
    this.secondFormGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      cost: new FormControl(''),
      description: new FormControl('', Validators.required),
      rarity: new FormControl('', Validators.required),
    });

    this.isValidatorsRequireditemName();
  }


  isValidatorsRequireditemName(): void {
    this.firstFormGroup.get('isNewItem')?.valueChanges.subscribe(val => {
      if (val == false) {
        this.firstFormGroup.controls['itemName'].setValidators([Validators.required]);
      } else {
        this.firstFormGroup.controls['itemName'].clearValidators();
      }
      this.firstFormGroup.controls['itemName'].updateValueAndValidity();
    });
  }

  getPregeneratedItem(event: any) {
    const query: string = this.firstFormGroup.get("itemName")?.value.toLowerCase();
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
      this.addMagicWeapons(resWeapons.results);
      const resMagicItems: ExternalOpen5EResponse = res[1];
      this.externalItems = resWeapons.results.concat(resMagicItems.results);
    });
  }

  addMagicWeapons(weapons: any[]) {
    weapons.forEach(weapon => {
      for(let i = 1; i <= 3; i++) {
        let item = {
          name: weapon.name + " +" + i,
          level_int: i,
          damage_type: weapon.damage_type,
          damage_dice: weapon.damage_dice,
          category: weapon.category
        }
        weapons.push(item)
      }
    });
    weapons.sort(function (a, b) {
      return a.name.localeCompare(b.name); 
    });
  }

  getScrolls(query: string): void {
    const rawQuery = query.split(" ");
    if(rawQuery.length == 3) {
      this.httpService.getScrolls(rawQuery[2]).subscribe(res => {
        const items: ExternalOpen5EResponse = res;
        items.results.forEach(item => {
          item.name = "Scroll Of " + item.name; 
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

    if(externalItem?.school) {
      externalItem.type = "scroll"
      externalItem.rarity = ItemConstants.scrollStatsMap.get(externalItem.level_int!)?.rarity!;
      externalItem.desc = "--- Level " + externalItem.level_int! + externalItem.school + " Spell Scroll with (if applicable) a Save DC of " + ItemConstants.scrollStatsMap.get(externalItem.level_int!)?.DC! + 
      " and an Atk Bonus of +" + ItemConstants.scrollStatsMap.get(externalItem.level_int!)?.attackBonus! + " --- " + externalItem.desc;
    }

     if(externalItem?.category){
      externalItem.type = "weapon";
      externalItem.rarity = externalItem.level_int ? ItemConstants.magicWeaponMap.get(externalItem.level_int)! : "common";
      const magicWeaponDesc = externalItem.level_int ? "Magic Weapon +" + externalItem.level_int : "";
      externalItem.desc = magicWeaponDesc + " --- " + externalItem.category.slice(0, -1) + " ---" + externalItem.damage_dice + " " + this.titleCasePipe.transform(externalItem.damage_type);
      externalItem.cost = externalItem.cost ? externalItem.cost!.replace(/[^\d.-]/g, '') : "";
    }

    const type: string[] = externalItem!.type.toLowerCase().split(" ");

    this.secondFormGroup.get("cost")?.setValue( externalItem!.cost ? Number(externalItem!.cost!) : 0 );
    this.secondFormGroup.get("description")?.setValue( externalItem!.desc);
    this.secondFormGroup.get("name")?.setValue( externalItem!.name.toLowerCase());
    this.secondFormGroup.get("rarity")?.setValue( externalItem!.rarity.toLowerCase());
    this.secondFormGroup.get("type")?.setValue(type[0]);

  }

  clearSelection(): void {
    if(!this.secondFormGroup.get("name")?.value) {
      this.firstFormGroup.get("itemName")?.setValue(undefined);
    }
  }

  getItemValue(): string {
    return this.secondFormGroup.get("cost")?.value ? this.secondFormGroup.get("cost")?.value : "——"
  }
}
