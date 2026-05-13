import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy.html',
  styleUrl: './privacy.css'
})
export class PrivacyPage implements OnInit {
  constructor(private titleService: Title) {}
  ngOnInit() {
    this.titleService.setTitle('Privacy Policy 2026 | Inspire Times');
  }
}
