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
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized: No session found" });
    }

    const token = session.user.accessToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    const { id, ...updatedFields } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/users/update-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, ...updatedFields }),
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
}

