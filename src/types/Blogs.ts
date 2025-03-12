import { StaticImageData } from "next/image";

export type BlogType = {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
  user?: { id: string; name: string };
  user_id: string;
  imageUrl?: string | StaticImageData;
  content: string;
};

export type CommentType = {
  id: string; // Use string for GUID
  user: string;
  text: string;
  replies?: CommentType[];
};
