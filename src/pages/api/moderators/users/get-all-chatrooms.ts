import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

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

    const token = session.user.accessToken;
    const { page_number, page_size } = req.body;
    const bodyData = {
      page_number,
      page_size,
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/moderator/get-all-chatrooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ message: data.message || "Failed to fetch assignments" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
