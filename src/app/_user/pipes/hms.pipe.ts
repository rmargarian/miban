import { Pipe, PipeTransform } from '@angular/core';
import { transformTime } from '@app/utils';

@Pipe({
  name: 'hms'
})
/**
 * Custom Pipe transforms number (seconds) to string in format:
 * hours 'h' minute 'm' seconds 's'.
 * Pads H, M and S with a leading zeros.
 */
export class HMSPipe implements PipeTransform {

  transform(value: number): string {
    return transformTime(value);
  }

}
