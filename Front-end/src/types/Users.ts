export type UserRole = "student" | "tutor" | "moderator";

export interface UserListType {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  address: string;
}
