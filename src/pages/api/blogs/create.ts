import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { APIResponse } from "@/types/APIResponse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const token = session.user.accessToken;

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { title, content } = req.body;

    const bodyData = {
      userId: session.user.id,
      title,
      content,
    };

    const response = await fetch(`${process.env.BACKEND_URL}/blogs/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyData),
    });

    if (response.ok) {
      res.status(200).json({ message: "Blog Created Successfully" });
      return;
    }

    const result: APIResponse = await response.json();

    res.status(response.status).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
