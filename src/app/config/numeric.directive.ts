import { Directive, ElementRef, Host, HostListener, Input, Optional } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: "[numeric]"
})
export class NumericDirective {
  @Input("decimals") decimals: number = 0;
  @Input("negative") negative: number = 0;
  @Input("separator") separator: string = ".";

  constructor(private el: ElementRef, @Optional() @Host() private ngControl: NgControl) {}

  private checkAllowNegative(value: string) {
    if (this.decimals <= 0) {
      return String(value).match(new RegExp(/^-?\d+$/));
    } else {
      var regExpString =
        "^-?\\s*((\\d+(\\"+ this.separator +"\\d{0," +
        this.decimals +
        "})?)|((\\d*(\\"+ this.separator +"\\d{1," +
        this.decimals +
        "}))))\\s*$";
      return String(value).match(new RegExp(regExpString));
    }
  }

  private check(value: string) {
    if (this.decimals <= 0) {
      return String(value).match(new RegExp(/^\d+$/));
    } else {
      var regExpString =
        "^\\s*((\\d+(\\"+ this.separator +"\\d{0," +
        this.decimals +
        "})?)|((\\d*(\\"+ this.separator +"\\d{1," +
        this.decimals +
        "}))))\\s*$";
      return String(value).match(new RegExp(regExpString));
    }
  }

  private run(oldValue: any) {
    setTimeout(() => {
      let currentValue: string = this.el.nativeElement.value;
      let allowNegative = this.negative > 0 ? true : false;

      if (allowNegative) {
        if (
          !["", "-"].includes(currentValue) &&
          !this.checkAllowNegative(currentValue)
        ) {
          if (this.ngControl) {
            this.ngControl.control!.setValue(oldValue);
          } else {
            this.el.nativeElement.value = oldValue;
          }
        }
      } else {
        if (currentValue !== "" && !this.check(currentValue)) {
          if (this.ngControl) {
            this.ngControl.control!.setValue(oldValue);
          } else {
            this.el.nativeElement.value = oldValue;
          }
        }
      }
    });
  }
  
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    console.log(event)
    if (this.ngControl) {
      console.log("DING", this.ngControl.value)
      this.run(this.ngControl.control!.value);
    } else {
      this.run(this.el.nativeElement.value);
    }
  }

  @HostListener("paste", ["$event"])
  onPaste(event: ClipboardEvent) {
    if (this.ngControl) {
      this.run(this.ngControl.control!.value);
    } else {
      this.run(this.el.nativeElement.value);
    }
  }
}