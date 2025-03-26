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

  // Check if session exists and if the user roles includes 'Moderator'
  const isModerator = session?.user?.roles?.includes("Moderator");

  if (!session || !isModerator) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Access is restricted to Moderators." });
  }

  const token = session.user.accessToken;

  try {
    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/api/reports/tutor-performance/excel`,
      {
        method: "POST",
        headers: {
          // No Content-Type needed as we are not sending a body
          Authorization: `Bearer ${token}`,
        },
        // No body needed for this endpoint
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend Excel error:", errorText);
      return res
        .status(backendResponse.status)
        .json({
          error: `Failed to fetch tutor performance Excel report. Status: ${backendResponse.status}`,
        });
    }

    // Check if the response body is available
    if (!backendResponse.body) {
      return res
        .status(500)
        .json({ error: "Backend response body is missing." });
    }

    // Set headers for Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=TutorPerformanceReport.xlsx"
    );

    // Stream the Excel content from the backend response to the client response
    const reader = backendResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      res.write(value);
    }
    res.end();
  } catch (error) {
    console.error("Failed to fetch tutor performance Excel report", error);
    return res
      .status(500)
      .json({
        error:
          "Internal Server Error while fetching tutor performance Excel report.",
      });
  }
}
