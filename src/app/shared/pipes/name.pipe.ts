// capitalize-truncate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'name'
})
export class NamePipe implements PipeTransform {
  transform(value: string|undefined,limit:number): string {
    if (value) {
    let firstLetterCapital = value.charAt(0).toUpperCase() + value.slice(1);


    if(firstLetterCapital.length>15){
      return firstLetterCapital.substring(0, limit) + '... '
    }else{
      return firstLetterCapital
    }
    
    }else{
      return ""
    }
  }
}
