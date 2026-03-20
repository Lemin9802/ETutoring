import { APIResponse } from "@/types/APIResponse";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
  const { documentId } = req.body;

  if (!documentId) {
    res.status(400).json({ message: "Missing documentId in request body" });
    return;
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    res.status(500).json({ message: "Backend URL is not configured" });
    return;
  }

  try {
    const response = await axios.post<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/documents/comments/get/${documentId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || "Failed to fetch comments",
      });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
}
