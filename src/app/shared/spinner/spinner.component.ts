import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [],
  template: `
    <div class="dot-loader">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `,
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {

}
