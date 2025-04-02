import { UserRole } from "@/pages/moderators/manage/users";

// export interface Message {
//   // id: string;
//   senderId: string;
//   senderName: string;
//   senderAvatar?: string;
//   content: string;
//   timestamp: Date;
//   isRead: boolean;
//   isDeleted: boolean;
//   isReported: boolean;
// }

export interface ChatRoom {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar?: string;
  lastMessage?: Message;
  lastMessageTime: Date;
  status: ChatRoomStatus;
  reportCount: number;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatPreview {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  recipientRole: UserRole;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  status: ChatRoomStatus;
}

export type ChatRoomStatus = 'active' | 'suspended' | 'closed';

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface ChatReport {
  id: string;
  chatRoomId: string;
  messageId: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedById?: string;
  resolvedByName?: string;
}

// API Response Types
export interface GetMessagesResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface GetChatsResponse {
  chats: ChatPreview[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface GetChatRoomsResponse {
  chatRooms: ChatRoom[];
  total: number;
  page: number;
  pageSize: number;
} 

export interface ConversationResponse {
  conversation_id: string;
  participant_id: string;
  chatroom_id: string;
  full_name: string;
  profile_picture?: string;
  last_message: string;
  last_message_time: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: Date;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: "student" | "tutor" | "moderator";
  isOnline: boolean;
}

export interface ChatPreview {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientRole: "student" | "tutor" | "moderator";
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  status: ChatRoomStatus;
}
