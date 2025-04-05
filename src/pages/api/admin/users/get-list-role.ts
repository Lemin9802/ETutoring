import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { APIResponse } from "@/types/APIResponse";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Chỉ cho phép phương thức POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { pageNumber, pageSize } = req.body;

  // Xác thực session
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Lấy access token từ session
  const token = session.user.accessToken;

  // Chuẩn bị dữ liệu gửi đi theo định dạng của API bên ngoài
  const bodyData = {
    page_number: pageNumber,
    page_size: pageSize,
  };

  try {
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/get-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyData),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return res.status(apiResponse.status).json({ error: errorData.error || "Failed to fetch roles" });
    }

    const result: APIResponse = await apiResponse.json();

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    // Trả về dữ liệu role trong property data
    return res.status(200).json({ data: result.data });
  } catch (error) {
    console.error("Failed to fetch roles", error);
    return res.status(500).json({ error: "Failed to fetch roles" });
  }
}
