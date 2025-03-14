import { APIResponse } from "@/types/APIResponse";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = session.user.accessToken;
  const { documentId } = req.body;

  if (!documentId) {
    return res.status(400).json({ message: "Missing documentId" });
  }

  try {
    const response = await axios.post<APIResponse>(
      `${process.env.BACKEND_URL}/api/documents/comments/get`,
      { documentId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error: unknown) {
    console.error("Error fetching comments:", error);

    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || "Internal Server Error",
      });
    }

    return res.status(500).json({ message: "Unexpected Error" });
  }
}
