import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
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

    const { meeting_id, status } = req.body;

    const bodyData = {
      meeting_id,
      status,
    };

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/meetings/change-status`,
      bodyData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || "An error occurred while creating meeting",
      });
    }

    return res.status(500).json({ message: "An error occurred" });
  }
}
