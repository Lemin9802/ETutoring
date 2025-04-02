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
    return res.status(401).json({
      error:
        "Unauthorized: Access is restricted to Moderators and Administrators.",
    });
  }

  const token = session.user.accessToken;

  try {
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reports/students/no-interaction/excel`, // Updated endpoint
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Sending JSON body
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ days }), // Send days in the body
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend Excel error:", errorText);
      return res.status(backendResponse.status).json({
        error: `Failed to fetch students without interaction Excel report. Status: ${backendResponse.status}`,
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
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // Correct Excel MIME type
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=StudentsWithoutInteractionReport_${days}days.xlsx` // Updated filename
    ); // Include days in filename

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
    console.error(
      "Failed to fetch students without interaction Excel report",
      error
    );
    return res.status(500).json({
      error:
        "Internal Server Error while fetching students without interaction Excel report.",
    });
  }
}
