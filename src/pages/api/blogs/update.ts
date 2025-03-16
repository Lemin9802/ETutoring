import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { APIResponse } from "@/types/APIResponse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = session.user.accessToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { blogId, title, content } = req.body;
    if (!blogId || !title || !content) {
      return res
        .status(400)
        .json({ message: "Blog ID, title, and content are required" });
    }

    // Gửi request cập nhật blog lên backend
    const response = await axios.post<APIResponse>(
      `${process.env.BACKEND_URL}/api/blogs/update`,
      { blogId, title, content },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Trả về dữ liệu
    return res.status(200).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        message:
          error.response?.data?.message ||
          "An error occurred while updating the blog",
      });
    }

    return res
      .status(500)
      .json({ message: "An error occurred while updating the blog" });
  }
}
