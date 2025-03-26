import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getServerSession } from "next-auth";
import { APIResponse } from "@/types/APIResponse";
import { authOptions } from "../../auth/[...nextauth]";

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

    const { blog_id, content } = req.body;

    const bodyData = {
      user_id: session.user.id,
      blog_id,
      content,
    };
    // Axios API Request
    const response = await axios.post<APIResponse>(
      `${process.env.BACKEND_URL}/api/comments/create`,
      bodyData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Success response
    return res.status(200).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        message:
          error.response?.data?.message ||
          "An error occurred while creating the blog",
      });
    }

    return res
      .status(500)
      .json({ message: "An error occurred while creating the blog" });
  }
}
