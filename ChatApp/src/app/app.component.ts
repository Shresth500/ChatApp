import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VideoChatService } from './Service/video-chat.service';
import { AuthService } from './Service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { VideoChatComponent } from './components/video-chat/video-chat.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private signalRService = inject(VideoChatService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    if (!this.authService.getAccessToken()) return;
    this.signalRService.startConnection();
    this.startOfferReceived();
  }

  startOfferReceived() {
    this.signalRService.offerReceived.subscribe(async (data) => {
      if (data) {
        let audio = new Audio('assets/phone-ringtone.mp3');
        audio.play();
        this.dialog.open(VideoChatComponent, {
          width: '400px',
          height: '600px',
          disableClose: false,
        });
        this.signalRService.remoteUserId = data.senderId;
        this.signalRService.incomingCall = true;
      }
    });
  }
}
