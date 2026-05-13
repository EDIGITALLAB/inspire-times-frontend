import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms.html',
  styleUrl: './terms.css'
})
export class TermsPage implements OnInit {
  constructor(private titleService: Title) {}
  ngOnInit() {
    this.titleService.setTitle('Terms & Conditions | Inspire Times');
  }
}
