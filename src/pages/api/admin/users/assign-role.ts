import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { APIResponse } from "@/types/APIResponse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { userId, roleId } = req.body;

  if (!userId || !roleId) {
    return res.status(400).json({ error: "Missing userId or role" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = session.user.accessToken;

  const bodyData = {
    user_id: userId,
    role_id: roleId,
  };

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/users/assign-role`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      }
    );

    if (!response.ok) {
      return res.status(400).json({ error: "Failed to assign role" });
    }

    const result: APIResponse = await response.json();

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json({ message: "Role assigned successfully" });
  } catch (error) {
    console.error("Failed to assign role", error);
    return res.status(500).json({ error: "Failed to assign role" });
  }
}
