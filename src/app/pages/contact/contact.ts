import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

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
  isSending = false;
  errorMessage = '';

  // Web3Forms access key
  private readonly accessKey = '8fe45948-5ea6-4f12-90f5-dc35e4e64826';

  constructor(
    private titleService: Title,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Contact Us | Inspire Times');
  }

  onSubmit() {
    this.isSending = true;
    this.errorMessage = '';

    const payload = {
      access_key: this.accessKey,
      name: this.contactData.name,
      email: this.contactData.email,
      subject: this.contactData.subject,
      message: this.contactData.message
    };

    this.http.post('https://api.web3forms.com/submit', payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.submitted = true;
          this.isSending = false;
          this.contactData = { name: '', email: '', subject: '', message: '' };
          setTimeout(() => {
            this.submitted = false;
          }, 4000);
        } else {
          this.errorMessage = response.message || 'Something went wrong. Please try again.';
          this.isSending = false;
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to send message. Please check your network connection.';
        this.isSending = false;
        console.error('Error sending message via Web3Forms:', err);
      }
    });
  }
}
