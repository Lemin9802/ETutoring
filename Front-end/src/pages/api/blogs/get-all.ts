import { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user.accessToken) {
      console.error("🚨 Unauthorized: No session or accessToken found!");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = session.user.accessToken;
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/get-all`, req.body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return res.status(200).json(response.data);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("🚨 AxiosError fetching blogs:", error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        message: "Internal Server Error",
        error: error.response?.data || error.message,
      });
    } else if (error instanceof Error) {
      console.error("🚨 Error fetching blogs:", error.message);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    } else {
      console.error("🚨 Unknown error occurred:", error);
      return res.status(500).json({ message: "Internal Server Error", error: "Unknown error" });
    }
  }
}
