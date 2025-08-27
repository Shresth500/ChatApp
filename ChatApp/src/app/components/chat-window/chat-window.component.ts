import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ChatService } from '../../Service/chat.service';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { AuthService } from '../../Service/auth.service';
import { VideoChatService } from '../../Service/video-chat.service';
import { MatDialog } from '@angular/material/dialog';
import { VideoChatComponent } from '../video-chat/video-chat.component';

@Component({
  selector: 'app-chat-window',
  imports: [TitleCasePipe, MatIconModule, FormsModule, ChatBoxComponent],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss',
})
export class ChatWindowComponent {
  @ViewChild('chatBox') chatContainer?: ElementRef;

  chatService = inject(ChatService);
  authService = inject(AuthService);
  signalRService = inject(VideoChatService);
  message: string = '';
  dialog = inject(MatDialog);

  constructor() {}
  sendMessage() {
    if (!this.message) return;
    this.chatService.sendMessage(this.message);
    this.message = '';
    this.scrollToBottom();
  }

  displayDialog(receiverId: string) {
    this.signalRService.remoteUserId = receiverId;
    this.dialog.open(VideoChatComponent, {
      width: '400px',
      height: '600px',
      disableClose: true,
      autoFocus: false,
    });
  }

  private scrollToBottom() {
    this.chatContainer!.nativeElement.scrollTop =
      this.chatContainer!.nativeElement.scrollHeight;
  }
}
