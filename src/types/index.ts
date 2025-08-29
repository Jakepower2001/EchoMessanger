export type User = {
  id: string;
  name?: string;
  email: string;
  username?: string;
};

export interface Message {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    timestamp: number;
}