import { APIResponse } from "@/types/APIResponse";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = session.user.accessToken;
  const { documentId, content, parentCommentId } = req.body;

  try {
    const bodyData = {
      document_id: documentId,
      commenter_id: session.user.id,
      content,
      parent_comment_id: parentCommentId,
    };

    const response = await axios.post<APIResponse>(
      `${process.env.BACKEND_URL}/api/documents/comments/create`,
      bodyData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    // Return the created comment with status 201 Created
    res.status(201).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || "Failed to create comment",
      });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
}
