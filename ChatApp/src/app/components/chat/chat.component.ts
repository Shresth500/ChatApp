import { Component } from '@angular/core';
import { ChatSidebarComponent } from '../chat-sidebar/chat-sidebar.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { ChatRightSidebarComponent } from '../chat-right-sidebar/chat-right-sidebar.component';

@Component({
  selector: 'app-chat',
  imports: [
    ChatSidebarComponent,
    ChatWindowComponent,
    ChatRightSidebarComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {}
