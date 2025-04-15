import { StaticImageData } from "next/image";

export type BlogType = {
  id: string;
  title: string;
  author: string;
  created_at: string;
  updatedAt?: string;
  user?: { id: string; name: string };
  user_id: string;
  imageUrl?: string | StaticImageData;
  content: string;
  userName?: string;
  user_full_name: string;
  is_liked?: boolean;
};

export type CommentType = {
  id: string;
  user: string;
  text: string;
  replies?: CommentType[];
};
