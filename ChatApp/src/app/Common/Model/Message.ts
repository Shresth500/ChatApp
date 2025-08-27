export interface Message {
  id: number;
  receiverId: string | null;
  senderId: string | null;
  content: string | null;
  createdAt: string;
  isRead: boolean;
}
