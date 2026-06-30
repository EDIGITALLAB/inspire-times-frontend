import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-disclaimer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './disclaimer.html',
  styleUrl: './disclaimer.css'
})
export class DisclaimerPage implements OnInit {
  constructor(private titleService: Title) {}
  ngOnInit() {
    this.titleService.setTitle('Disclaimer | Inspire Times');
  }
}
