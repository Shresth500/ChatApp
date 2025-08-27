import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { User } from '../Common/Model/User';
import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
  HubConnectionState,
} from '@microsoft/signalr';
import { Message } from '../Common/Model/Message';
import { on } from 'events';
import { error } from 'console';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private authService = inject(AuthService);
  private hubUrl = `http://localhost:5173/hubs/chat`;
  onlineUsers = signal<User[]>([]);
  currentOpenChat = signal<User | null>(null);
  isLoading = signal<boolean>(true);

  autoScrollEnable = signal<boolean>(true);

  chatMessage = signal<Message[]>([]);
  private hubConnection?: HubConnection;

  startConnection(token: string, senderId?: string) {
    if (this.hubConnection?.state === HubConnectionState.Connected) return;

    if (this.hubConnection) {
      this.hubConnection.off('NotifyTypingToUser');
      this.hubConnection.off('Notify');
      this.hubConnection.off('OnlineUsers');
      this.hubConnection.off('ReceiveMessageList');
      this.hubConnection.off('ReceiveMessage');
      this.hubConnection.off('SendMessage');
      this.hubConnection.off('LoadMessages');
    }

    this.isLoading.update(() => true);
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}?senderId=${senderId || ''}`, {
        // skipNegotiation: true,
        accessTokenFactory: () => token,
        // transport: HttpTransportType.WebSockets,
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection Started');
      })
      .catch((error) => {
        console.log('Connection or login error', error);
      });

    this.hubConnection?.on('Notify', (user: User) => {
      Notification.requestPermission().then((result) => {
        if (result == 'granted') {
          new Notification('Active Now', {
            body: user.fullName + ' is online now',
            icon: user.profileImagePath,
          });
        }
      });
    });

    this.hubConnection?.on('NotifyTypingToUser', (senderUserName) => {
      this.onlineUsers.update((users) => {
        users.map((user) => {
          if (user.userName === senderUserName) user.isTyping = true;
        });
        return users;
      });
      setTimeout(() => {
        this.onlineUsers.update((users) => {
          users.map((user) => {
            user.isTyping = false;
          });
          return users;
        });
      }, 2000);
    });

    this.hubConnection!.on('OnlineUsers', (user: User[]) => {
      console.log(user);
      this.onlineUsers.update(() =>
        user.filter(
          (user) =>
            user.userName !== this.authService.CurrentLoginUser?.userName
        )
      );
    });

    // this.hubConnection!.on('ReceiveMessageList', (message) => {
    //   this.chatMessage.update((messages) => [...message, ...messages]);
    // });

    this.hubConnection!.on(
      'ReceiveMessageList',
      (messagesFromServer: Message[]) => {
        this.chatMessage.update((existing) => {
          const existingIds = new Set(existing.map((m) => m.id));
          const merged = [
            ...messagesFromServer.filter((m) => !existingIds.has(m.id)),
            ...existing,
          ];
          return merged;
        });
      }
    );

    // this.hubConnection?.on('ReceiveMessage', (message) => {
    //   let audio = new Audio('assets/Notification.mp3');
    //   audio.play();
    //   document.title = '(1) New Message';
    //   this.chatMessage.update((messages) => [...messages, message]);
    // });

    this.hubConnection?.on('ReceiveMessage', (message: Message) => {
      let audio = new Audio('assets/Notification.mp3');
      audio.play();
      document.title = '(1) New Message';

      this.chatMessage.update((messages) => {
        if (
          messages.some(
            (m) => m.id === message.id && m.content === message.content
          )
        ) {
          return messages; // already exists
        }
        return [...messages, message];
      });
    });

    this.isLoading.update(() => false);
  }

  constructor() {}

  sendMessage(message: string) {
    this.chatMessage.update((messages) => [
      ...messages,
      {
        content: message,
        senderId: this.authService.CurrentLoginUser!.id,
        receiverId: this.currentOpenChat()!.id,
        createdAt: new Date().toString(),
        isRead: false,
        id: 0,
      },
    ]);
    this.hubConnection
      ?.invoke('SendMessage', {
        receiverId: this.currentOpenChat()!.id,
        content: message,
      })
      .then((id) => {
        console.log('message sent to', id);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  disConnectConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected)
      this.hubConnection.stop().catch((error) => console.log(error));
  }

  loadMessages(pageNumber: number) {
    this.isLoading.update(() => true);
    this.hubConnection
      ?.invoke('LoadMessages', this.currentOpenChat()!.id, pageNumber)
      .then()
      .catch()
      .finally(() => {
        this.isLoading.update(() => false);
      });
  }

  status(username: string): string {
    const currentChatUser = this.currentOpenChat;
    if (!currentChatUser) return 'offline';

    const onlineUser = this.onlineUsers().find(
      (user) => user.userName === username
    );
    return onlineUser?.isTyping ? 'Typing....' : this.isUserOnline();
  }

  isUserOnline(): string {
    let onlineUser = this.onlineUsers().find(
      (user) => user.userName === this.currentOpenChat()?.userName
    );
    return onlineUser?.isOnline ? 'Online' : this.currentOpenChat()!.userName;
  }
  notifyTyping() {
    console.log(this.currentOpenChat()!.userName);
    this.hubConnection!.invoke('NotifyTyping', this.currentOpenChat()!.userName)
      .then((x) => {
        console.log(x);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
