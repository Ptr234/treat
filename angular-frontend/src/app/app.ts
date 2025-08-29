import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header.component';
import { FooterComponent } from './components/footer.component';
import { NotificationComponent } from './components/notification.component';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('OneStop Centre Uganda');

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Initialize app
    setTimeout(() => {
      this.notificationService.info(
        'Welcome!', 
        'OneStop Centre Uganda - Your gateway to business success in Uganda'
      );
    }, 1000);
  }
}
