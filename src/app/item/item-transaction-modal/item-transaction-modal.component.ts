import { TitleCasePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { ItemActions, ItemConstants, ItemValueByRarity } from 'src/app/config/ItemConstants';
import { ExternalItem } from 'src/app/models/ExternalItem';
import { ExternalOpen5EResponse } from 'src/app/models/ExternalOpen5EResponse';
import { Item } from 'src/app/models/Item';
import { ItemHistory } from 'src/app/models/ItemHistory';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';
import { HttpService } from 'src/app/services/http/http.service';
import { ItemService } from 'src/app/services/item/item.service';
import { MessageService } from 'src/app/services/message/message.service';
import { UserService } from 'src/app/services/user/user.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { SnackbarComponent } from 'src/app/shared/snackbar/snackbar.component';

@Component({
  selector: 'app-item-transaction-modal',
  templateUrl: './item-transaction-modal.component.html',
  styleUrls: ['./item-transaction-modal.component.css']
})
export class ItemTransactionModalComponent implements OnInit {
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  externalItems: ExternalItem[] = [];
  itemTypes: string[] = ItemConstants.itemTypes;
  rarityTypes: string[] = ItemConstants.rarityTypes;
  pregeneratedItem: Item = new Item;

  constructor(private httpService: HttpService, public titleCasePipe: TitleCasePipe, public dialog: MatDialog,
    public dialogRef: MatDialogRef<ItemTransactionModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    public firestoreService: FirestoreService, private itemService: ItemService, public userService: UserService, 
    private snackBar: MatSnackBar, private messageService: MessageService) { }

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
      origin: new FormControl('', Validators.required),
      rarity: new FormControl('', Validators.required),
      quantity: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(9999), Validators.pattern('^(0|[1-9][0-9]*)$')])
    });

    this.isValidatorsRequireditemName();
  }


  isValidatorsRequireditemName(): void {
    this.firstFormGroup.get('isNewItem')?.valueChanges.subscribe(val => {
      if (val == false) {
        this.firstFormGroup.controls['itemName'].setValidators([Validators.required]);
      } else {
        this.secondFormGroup.reset();
        this.secondFormGroup.get("quantity")?.setValue(1);
        this.firstFormGroup.controls['itemName'].clearValidators();
      }
      this.firstFormGroup.controls['itemName'].updateValueAndValidity();
    });
  }

  getPregeneratedItem(event: any) {
    const query: string = this.firstFormGroup.get("itemName")?.value.toLowerCase();
    if (query.toLowerCase().indexOf("scroll of") !== -1) {
      this.getScrolls(query);
    } else if (query.length > 3 && (this.externalItems.length == 0 || event.key === 'Backspace')) {
      this.getMagicItems(query);
    } else {
      if (query.length <= 3) {
        this.externalItems = [];
      }
      this.filterExternalItems(query);
    }
  }

  getMagicItems(query: string): void {
    let gemstones = this.httpService.getGemstones();
    let weapons = this.httpService.getWeapons(query)
    let magicItems = this.httpService.getMagicItems(query)

    forkJoin([weapons, magicItems, gemstones]).subscribe(res => {
      const resWeapons: ExternalOpen5EResponse = res[0];
      this.addMagicWeapons(resWeapons.results);
      const resMagicItems: ExternalOpen5EResponse = res[1];
      const resGemstones: ExternalItem[] = <ExternalItem[]>res[2];
      this.externalItems = resWeapons.results.concat(resMagicItems.results.concat(resGemstones));
      this.filterExternalItems(query);
      this.itemService.sortItemsAsscendingByName(this.externalItems);
    });
  }

  addMagicWeapons(weapons: any[]) {
    weapons.forEach(weapon => {
      for (let i = 1; i <= 3; i++) {
        let item = {
          name: weapon.name + " +" + i,
          level_int: i,
          damage_type: weapon.damage_type,
          damage_dice: weapon.damage_dice,
          category: weapon.category,
          properties: weapon.properties
        }
        weapons.push(item)
      }
    });
    weapons.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
  }

  getScrolls(query: string): void {
    const rawQuery = query.split("scroll of");
      this.httpService.getScrolls(rawQuery[1]).subscribe(res => {
        const items: ExternalOpen5EResponse = res;
        items.results.forEach(item => {
          item.name = "Scroll Of " + item.name;
        });
        this.externalItems = items.results;
      });
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

    if (externalItem?.school) {
      this.buildScroll(externalItem);
    }

    if (externalItem?.category) {
      this.buildWeapon(externalItem)
    }

    const type: string[] = externalItem!.type.toLowerCase().split("(");
    const rarity: string = ItemConstants.rarityTypes.indexOf(externalItem!.rarity) !== -1 ? externalItem!.rarity : "";

    this.secondFormGroup.get("cost")?.setValue(externalItem!.cost);
    this.secondFormGroup.get("description")?.setValue(externalItem!.desc);
    this.secondFormGroup.get("name")?.setValue(externalItem!.name.toLowerCase());
    this.secondFormGroup.get("rarity")?.setValue(rarity);
    this.secondFormGroup.get("type")?.setValue(type[0].trim());

    this.pregeneratedItem = this.buildItem();
  }

  buildScroll(externalItem: ExternalItem): void {
    externalItem.type = "scroll"
    externalItem.rarity = ItemConstants.scrollStatsMap.get(externalItem.level_int!)?.rarity!;
    externalItem.desc = "Level " + externalItem.level_int + " Spell Scroll\n" +
      "Casting Time: " + externalItem.casting_time + "\n" +
      "Range: " + externalItem.range + "\n" +
      "Duration: " + externalItem.duration + "\n" +
      "Save DC (if applicable): " + ItemConstants.scrollStatsMap.get(externalItem.level_int!)?.DC! + "\n" +
      "Attack Bonus (if applicable): " + ItemConstants.scrollStatsMap.get(externalItem.level_int!)?.attackBonus! + "\n\n" +
      externalItem.desc;
  }

  buildWeapon(externalItem: ExternalItem): void {
    externalItem.type = "weapon";
    externalItem.rarity = externalItem.level_int ? ItemConstants.magicWeaponMap.get(externalItem.level_int)! : "common";

    if(externalItem.level_int) {
      externalItem.properties!.push("magic");
    }
    let properties: string = "";
    externalItem.properties?.forEach(property => {
      let comma = properties === "" ? "" : ", "
      properties = properties + comma + this.titleCasePipe.transform(property)
    });

    const magicWeaponModifier = externalItem.level_int ? " +" + externalItem.level_int : "";
    externalItem.desc = "Category: " + externalItem.category!.slice(0, -1) + "\n" +
    "Damage: " + externalItem.damage_dice + magicWeaponModifier + "\n" +
    "Damage Type: " + this.titleCasePipe.transform(externalItem.damage_type) + "\n" +
    "Properties: " + properties!
    externalItem.cost = externalItem.cost ? externalItem.cost!.replace(/[^\d.-]/g, '') : "";
  }

  clearSelection(): void {
    if (!this.secondFormGroup.get("name")?.value) {
      this.firstFormGroup.get("itemName")?.setValue(undefined);
    }
  }

  getItemValue(): string {
    return this.secondFormGroup.get("cost")?.value ? this.secondFormGroup.get("cost")?.value : "??? ???"
  }

  getSuggestedCost(): number {
    let multiplier: number = 1;

    if (this.secondFormGroup.get('type')?.value.toLowerCase() === "potion" || this.secondFormGroup.get('type')?.value.toLowerCase() === "scroll") {
      multiplier = 0.5;
    }

    switch (this.secondFormGroup.get("rarity")!.value.toLowerCase()) {
      case "common":
        return ItemValueByRarity.COMMON * multiplier;
      case "uncommon":
        return ItemValueByRarity.UNCOMMON * multiplier;
      case "rare":
        return ItemValueByRarity.RARE * multiplier;
      case "very rare":
        return ItemValueByRarity.VERYRARE * multiplier;
      case "legendary":
        return ItemValueByRarity.LEGENDARY * multiplier;
      case "artifact":
        return ItemValueByRarity.ARTIFACT * multiplier;
      default:
        return 0;
    }
  }

  shouldDisplaySuggestedCost(): boolean {
    return this.secondFormGroup.get('rarity')?.value &&
      !(this.secondFormGroup.get('type')?.value == 'gemstone' || (this.secondFormGroup.get('type')?.value == 'weapon' && this.secondFormGroup.get('rarity')?.value == 'common'));
  }

  depositItem(): void {
    if (this.secondFormGroup.valid) {
      let amountToCreate: string = "";
      if(this.secondFormGroup.get('quantity')?.value > 1) {
        amountToCreate = "Quantity To Create: " + this.secondFormGroup.get("quantity")?.value + "\n";
      }

      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          confirm: "confirm",
          cancel: "go back",
          title: "complete deposit of " + this.secondFormGroup.get("quantity")?.value + " item(s)?",
          message: "Name: " + this.titleCasePipe.transform(this.secondFormGroup.get("name")?.value) + "\n" +
            "Type: " + this.titleCasePipe.transform(this.secondFormGroup.get("type")?.value) + "\n" +
            "Rarity: " + this.titleCasePipe.transform(this.secondFormGroup.get("rarity")?.value) + "\n" +
            "Value In Silver: " + this.getItemValue() + "\n" +
            amountToCreate +
            this.secondFormGroup.get("description")?.value
        }
      });

      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult) {
          this.completeTransaction();
        }
      });
    }
  }

  completeTransaction(): void {
    let itemData = this.itemService.transformToObject(this.buildItem());
    let itemHistory = this.itemService.transformToObject(this.buildItemHistory())
    const isPregen = this.isPregeneratedItem(itemData);
    if(!isPregen) {
      itemData.name = itemData.name + "*";
      itemHistory.itemName = itemData.name;
    }

    // FIND IF THERE IS EXISTING ITEM WITH SAME NAME
    this.firestoreService.getItemsByNameTypeAndOwner(itemData.name, itemData.type, this.data.createdFor).subscribe(res => {
      const duplicateItem: Item = <Item>res.docs[0]?.data();
      const duplicateItemId = res.docs[0]?.id

      // UPDATE QUANTITY AND COST FOR EXISTING ITEM IF PRESENT
      if(duplicateItem !== undefined && isPregen) {
        if(this.secondFormGroup.get("cost")?.value === undefined) {
          this.firestoreService.updateItemQuantity(duplicateItemId, this.secondFormGroup.get("quantity")?.value + duplicateItem.quantity, this.data.user.id).then(res => {
            this.openSnackbar(this.messageService.itemActionMessage(itemData.name, itemData.quantity, ItemActions.CREATE), false);
          });
        } else {
          this.firestoreService.updateItemQuantityAndCost(duplicateItemId, this.secondFormGroup.get("quantity")?.value + duplicateItem.quantity, this.secondFormGroup.get("cost")?.value, this.data.user.id).then(res => {
            this.openSnackbar(this.messageService.itemActionMessage(itemData.name, itemData.quantity, ItemActions.CREATE), false);
          });
        }
        this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistory(duplicateItemId, duplicateItem)), duplicateItemId);
      // CREATE NEW ITEM IF NO EXISTING ITEM IS PRESENT
      } else {
        this.firestoreService.createItem(itemData, itemHistory, this.data.user.id).then(res => {
          this.openSnackbar(this.messageService.itemActionMessage(itemData.name, itemData.quantity, ItemActions.CREATE), false);
        });
      }
      this.closeModal();
    })

  }

  buildItem(): Item {
    return this.itemService.buildItem(
    this.secondFormGroup.get("name")?.value,
    this.secondFormGroup.get("rarity")?.value,
    this.secondFormGroup.get("type")?.value,
    this.secondFormGroup.get("cost")?.value ? this.secondFormGroup.get("cost")?.value : null,
    this.secondFormGroup.get("description")?.value,
    this.data.createdFor,
    this.secondFormGroup.get("quantity")?.value,
    );
  }

  buildItemHistory(duplicateItemId?: string, duplicateItem?: Item): ItemHistory {
    let previousCost = duplicateItem?.cost === null ? 0 : duplicateItem?.cost
    return this.itemService.buildItemHistory(
    duplicateItemId,
    this.secondFormGroup.get("name")?.value,
    this.secondFormGroup.get("rarity")?.value,
    ItemActions.CREATE,
    this.userService.getUserLabel(this.data.user),
    undefined,
    this.data.createdFor,
    duplicateItem?.quantity,
    duplicateItem ? this.secondFormGroup.get("quantity")?.value + duplicateItem.quantity : this.secondFormGroup.get("quantity")?.value,
    duplicateItem?.cost !== this.secondFormGroup.get("cost")?.value && this.secondFormGroup.get("cost")?.value !== undefined? previousCost : undefined,
    duplicateItem?.cost !== this.secondFormGroup.get("cost")?.value ? this.secondFormGroup.get("cost")?.value : undefined,
    this.secondFormGroup.get("origin")?.value
    );
  }

  isPregeneratedItem(itemToCheck: Item): boolean {
    let rarityMatch: boolean = true;
    let costsMatch: boolean = true;
    if(this.pregeneratedItem.rarity) {
      rarityMatch = itemToCheck.rarity === this.pregeneratedItem.rarity 
    }

    if(this.pregeneratedItem.cost) {
      costsMatch = itemToCheck.cost === this.pregeneratedItem.cost 
    }

    return itemToCheck.name === this.pregeneratedItem.name && 
    itemToCheck.type === this.pregeneratedItem.type &&
    itemToCheck.description === this.pregeneratedItem.description &&
    rarityMatch && costsMatch
  }

  openSnackbar(message: string, isError: boolean): void {
    this.snackBar.openFromComponent(SnackbarComponent, {
      duration: 5000,
      horizontalPosition: "center",
      verticalPosition: "top",
      data: {
        message: message,
        isError: isError
      }
    });
  }

  closeModal(): void {
    this.dialog.closeAll();
  }
}
