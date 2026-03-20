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

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({
      error: "Unauthorized: Authentication required to schedule a session.",
    });
  }

  const token = session.user.accessToken;
  const { title, description, start_time, end_time, receiver_id } = req.body;

  const scheduleSession = async (token: string, title: string, description: string, start_time: string, end_time: string, receiver_id: string) => {
    try {
      const backendResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/meetings/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, description, start_time, end_time, receiver_id }),
        }
      );

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error("Backend error:", errorText);
        throw new Error(`Failed to schedule session. Status: ${backendResponse.status}`);
      }

      return await backendResponse.json();
    } catch (error: unknown) {
      console.error("Failed to schedule session", error);
      throw new Error("Internal Server Error while scheduling session.");
    }
  };

  try {
    const result = await scheduleSession(token, title, description, start_time, end_time, receiver_id);
    return res.status(200).json(result);
  } catch (error: unknown) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'An unexpected error occurred' });
  }
}