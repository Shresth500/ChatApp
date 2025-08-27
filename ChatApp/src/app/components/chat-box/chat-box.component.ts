import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnChanges,
  SimpleChanges,
  ViewChild,
  viewChild,
} from '@angular/core';
import { ChatService } from '../../Service/chat.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '../../Service/auth.service';
import { DatePipe, JsonPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-chat-box',
  imports: [MatProgressSpinner, DatePipe, MatIconModule],
  templateUrl: './chat-box.component.html',
  styleUrl: './chat-box.component.scss',
})
export class ChatBoxComponent implements AfterViewInit, OnChanges {
  @ViewChild('chatBox', { read: ElementRef }) public chatBox?: ElementRef;

  chatService = inject(ChatService);
  authService = inject(AuthService);
  private pageNumber = 2;

  constructor() {
    console.log(this.chatService.chatMessage());
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.chatService.chatMessage());
  }

  ngAfterViewInit(): void {
    if (this.chatService.autoScrollEnable()) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    if (this.chatBox) {
      this.chatService.autoScrollEnable.set(true);
      this.chatBox.nativeElement.scrollTo({
        top: this.chatBox.nativeElement.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  scrollTop() {
    if (this.chatBox) {
      this.chatService.autoScrollEnable.set(false);
      this.chatBox.nativeElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }

  loadMoreMessages() {
    this.pageNumber++;
    this.chatService.loadMessages(this.pageNumber);
    this.scrollTop();
  }
}
