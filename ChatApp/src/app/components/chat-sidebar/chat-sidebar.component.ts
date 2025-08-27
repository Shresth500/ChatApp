import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../Service/auth.service';
import { Router } from '@angular/router';
import { Console } from 'console';
import { TitleCasePipe } from '@angular/common';
import { ChatService } from '../../Service/chat.service';
import { User } from '../../Common/Model/User';
import { TypingIndicatorComponent } from '../typing-indicator/typing-indicator.component';

@Component({
  selector: 'app-chat-sidebar',
  imports: [
    MatIconModule,
    MatMenuModule,
    TitleCasePipe,
    TypingIndicatorComponent,
  ],
  templateUrl: './chat-sidebar.component.html',
  styleUrl: './chat-sidebar.component.scss',
})
export class ChatSidebarComponent implements OnInit {
  authService = inject(AuthService);
  chatService = inject(ChatService);
  router = inject(Router);
  constructor() {}
  ngOnInit(): void {
    this.chatService.startConnection(this.authService.getAccessToken()!);
  }
  logout() {
    this.authService.logout();
    this.chatService.disConnectConnection();
    this.router.navigate(['/', 'login']);
  }

  OpenChatWindow(user: User) {
    this.chatService.chatMessage.update(() => []);
    this.chatService.currentOpenChat.set(user);
    this.chatService.loadMessages(1);
  }
}
