import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class ContactPage implements OnInit {
  contactData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  submitted = false;

  constructor(private titleService: Title) {}

  ngOnInit() {
    this.titleService.setTitle('Contact Us | Inspire Times');
  }

  onSubmit() {
    console.log('Contact form submitted:', this.contactData);
    this.submitted = true;
    // Reset after 3 seconds
    setTimeout(() => {
      this.submitted = false;
      this.contactData = { name: '', email: '', subject: '', message: '' };
    }, 3000);
  }
}
