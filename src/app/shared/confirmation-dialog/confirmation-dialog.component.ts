import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {

  dialogData: any;

  constructor(
      public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
              ) {}

  ngOnInit() {

  }

  onConfirm(): void {
      // Close the dialog, return true
      this.dialogRef.close(true);
  }

  onDismiss(): void {
      // Close the dialog, return false
      this.dialogRef.close(false);
  }

}
