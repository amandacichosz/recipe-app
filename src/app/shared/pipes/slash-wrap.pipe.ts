import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'slashWrap' })
export class SlashWrapPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value
    return value.replace(/(.)\/(.)/g, '<small>$1/$2</small>')
  }
}
