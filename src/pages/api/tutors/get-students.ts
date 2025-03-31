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

  // Get session
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Lấy accessToken từ session
  const token = session.user.accessToken;

  const { page, size, search, filters } = req.body;

  const bodyData = {
    tutor_id: session.user.id,
    search: search,
    filters: filters,
    meta: {
      page_number: page,
      page_size: size,
      total_pages: 0,
      total_items: 0,
    },
  };

  try {
    const response = await axios.post<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tutor/get-students`,
      bodyData,
      {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || "An error occurred while fetching students",
      });
    }
    return res.status(500).json({ message: "An error occurred" });
  }
}
