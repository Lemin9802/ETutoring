import { APIResponse } from "@/types/APIResponse";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = session.user.accessToken;

    // Parse the form data
    const form = formidable();
    const [fields, files] = await form.parse(req);

    // Get fields from the form
    const uploaderId = fields.uploaderId?.[0];
    const tutorId = fields.tutorId?.[0];
    const title = fields.title?.[0];

    // Get the file
    const file = files.file?.[0];

    if (!file || !uploaderId || !tutorId || !title) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Create Node.js FormData for the backend request
    const formData = new FormData();
    formData.append("uploaderId", uploaderId);
    formData.append("tutorId", tutorId);
    formData.append("title", title);

    // Append file as a stream
    const fileStream = fs.createReadStream(file.filepath);
    formData.append("file", fileStream, {
      filename: file.originalFilename || "document.pdf",
      contentType: file.mimetype || "application/octet-stream",
    });

    // Send to backend
    const response = await axios.post<APIResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/documents/upload`,
      formData,
      {
        headers: {
          Authorization: "Bearer " + token,
          ...formData.getHeaders(),
        },
      }
    );

    // Return the response from the backend
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error uploading document:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
    });
  }
}
