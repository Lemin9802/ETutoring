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
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = session.user.accessToken;

  const { page, size, search, filters } = req.body;

  // For development, use mock data
  // TODO: Replace with actual API call in production
  // if (process.env.NODE_ENV === "development") {
  //   const mockData = await getTutorStudents(page, size, search, filters);
  //   return res.status(200).json({
  //     data: mockData.data,
  //     total_count: mockData.total_count,
  //     page: mockData.page,
  //     size: mockData.size,
  //     has_next: mockData.has_next,
  //     has_previous: mockData.has_previous,
  //     message: "Success",
  //   });
  // }

  // For production
  try {
    const response = await axios.post<APIResponse>(
      `${process.env.BACKEND_URL}/api/tutor/get-students`,
      {
        tutor_id: session.user.id,
        page,
        size,
        search,
        filters,
      },
      {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).json(response.data);
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
