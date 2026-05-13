import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  email: string = '';
  subscribed: boolean = false;

  subscribe() {
    if (this.email && this.email.includes('@')) {
      this.subscribed = true;
      console.log('Subscribed with:', this.email);
      setTimeout(() => {
        this.subscribed = false;
        this.email = '';
      }, 3000);
    }
  }
}
