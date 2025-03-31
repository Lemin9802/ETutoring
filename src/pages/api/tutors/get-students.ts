import { APIResponse } from "@/types/APIResponse";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Get session
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Lấy page và size (nếu bạn muốn phân trang)
  const { page, size } = req.body;
  // Lấy accessToken từ session
  const token = session.user.accessToken;

  try {
    // Gọi Backend API với cấu trúc body như yêu cầu
    const response = await axios.post<APIResponse>(
      `${process.env.BACKEND_URL}/api/tutor/get-students`,
      {
        tutor_id: session.user.id, // lấy từ session
        meta: {
          page_number: page || 0,
          page_size: size || 0,
          total_pages: 0,    // tạm để 0 (hoặc tuỳ logic bên backend)
          total_items: 0,    // tạm để 0 (hoặc tuỳ logic bên backend)
        },
      },
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
        message:
          error.response?.data?.message ||
          "An error occurred while fetching students",
      });
    }
    return res.status(500).json({ message: "An error occurred" });
  }
}
