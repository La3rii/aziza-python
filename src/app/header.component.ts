// header.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header style="background-color: #d12a2a; color: white; padding: 1rem;">
     <img src="assets/aziza.png" style="height: 50px; vertical-align: middle;">
      <nav style="display: inline-block; margin-left: 2rem;">
      </nav>
    </header>
  `
})
export class HeaderComponent {}
