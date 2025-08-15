import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer style="
      background-color: #b22121;
      color: white;
      padding: 2rem 1rem;
      margin-top: 3rem;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
    ">
      <div style="
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
        max-width: 1200px;
        margin: 0 auto;
        text-align: center;
      ">
        <div style="font-size: 1.1rem; font-weight: 500;">
          © 2025 Aziza — Tous droits réservés
        </div>
        
        <div style="font-size: 1rem;">
          Contact: +216 71 384 251 | info@aziza.tn
        </div>
        
        <div style="
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 0.5rem;
        ">
          <a href="#" style="
            color: #ffeb3b;
            text-decoration: none;
            transition: opacity 0.3s;
          ">
            Facebook
          </a>
          <a href="#" style="
            color: #ffeb3b;
            text-decoration: none;
            transition: opacity 0.3s;
          ">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    a:hover {
      opacity: 0.8;
    }
  `]
})
export class FooterComponent {}