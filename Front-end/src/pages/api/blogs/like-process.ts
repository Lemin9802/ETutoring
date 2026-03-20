import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";  
import { APIResponse } from "@/types/APIResponse";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = session.user.accessToken;

    const { blogId, blog_id } = req.body as { blogId?: string; blog_id?: string };
    const id = blogId || blog_id; 
    if (!id) {
      return res.status(400).json({ message: "Blog ID is required" });
    }

    const response = await axios.post<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/blogs/like-process`,
      { blogId: id },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.status(response.status).json(response.data);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        message:
          error.response?.data?.message ||
          "An error occurred while processing the request",
      });
    }
    return res
      .status(500)
      .json({ message: "An unknown error occurred" });
  }
}