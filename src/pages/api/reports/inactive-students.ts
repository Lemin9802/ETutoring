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

  const { days } = req.body;

  // Validate days parameter
  if (typeof days !== "number" || days <= 0) {
    return res.status(400).json({
      error: "Invalid 'days' parameter. It must be a positive number.",
    });
  }

  const session = await getServerSession(req, res, authOptions);

  // Check if session exists and if the user has the required role
  const roles = session?.user?.roles;
  const isAuthorized = roles?.includes("Moderator") || roles?.includes("Admin");

  if (!session || !isAuthorized) {
    return res
      .status(401)
      .json({
        error:
          "Unauthorized: Access is restricted to Moderators and Administrators.",
      });
  }

  const token = session.user.accessToken;

  try {
    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/api/reports/students/inactive`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ days }), // Send days in the body
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend error:", errorText);
      return res.status(backendResponse.status).json({
        error: `Failed to fetch inactive students data. Status: ${backendResponse.status}`,
      });
    }

    // Assuming the backend returns JSON data directly
    const result = await backendResponse.json();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Failed to fetch inactive students data", error);
    return res.status(500).json({
      error: "Internal Server Error while fetching inactive students data.",
    });
  }
}
