export interface User {
  id: string;
  profileImagePath: string;
  fullName: string;
  isOnline: boolean;
  userName: string;
  connectionId: string;
  lastMessage: string;
  unreadCount: number;
  isTyping: boolean;
}
