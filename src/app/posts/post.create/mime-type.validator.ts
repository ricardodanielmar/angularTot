import { AbstractControl } from "@angular/forms";
import { Observable, Observer, of } from "rxjs";

export const mimeType = (control: AbstractControl): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> |  Observable<null> => {
  if(typeof(control.value === 'string')){
    return of(null);
  }
  const file = control.value as File;
  const fileReader = new FileReader();
  const frObs = Observable.create((observer: Observer<{ [key: string]: any } | null>) => {
    fileReader.addEventListener("loadend", () => {
      const arr = new Uint8Array((fileReader.result as ArrayBufferLike)).subarray(0, 4);
      let header = '';
      let isValid = false;
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      switch (header) {
        case "89504e47":
          isValid = true;
          break;
        case "ffd8ffe0":
        case "fd8ffe1":
        case "fd8ffe2":
        case "fd8ffe3":
        case "fd8ffe8":
          isValid = true;
          break;
        default:
          isValid = false;
          break;
      }
      isValid ? observer.next(null) : observer.next({ invalidMimeType: true });
      observer.complete();
    });
    fileReader.readAsArrayBuffer(file);
  });
  return frObs;
};
