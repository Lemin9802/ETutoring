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

    if (!session?.user?.accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user_id = session.user.id; // Assuming user ID is stored in session

    const bodyData = {
      user_id,
    };

    // Send request to backend
    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/get-all`, bodyData, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    

    return res.status(200).json(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || "An error occurred",
      });
    }

    return res.status(500).json({ message: "An unexpected error occurred" });
  }
}
