import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';
import { SalaryGroupingComponent } from './salary-grouping/salary-grouping.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, SalaryGroupingComponent],
  template: `
    <app-header></app-header>
    <main class="content">
      <app-salary-grouping></app-salary-grouping>
    </main>
    <app-footer></app-footer>
  `,
  styleUrls: ['./app.css']
})
export class App {
  title = 'salary-grouping-app';
}
