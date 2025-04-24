import { APIResponse } from "@/types/APIResponse";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    // Handle any other HTTP method
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (session.user.roles[0].includes("Students")) {
    return res.status(200).json({
      message: "You are not authorized to access this resource",
    });
  }

  const token = session.user.accessToken;

  const { page_number, page_size } = req.body;

  const response = await axios.post<APIResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/students/get-tutors`,
    {
      student_id: session.user.id,
      page_number: page_number,
      page_size: page_size,
    },
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  res.status(200).json(response.data);
}
