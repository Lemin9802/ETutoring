import React, { useState, useEffect } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import {
  PlusOutlined,
  MinusOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import * as pdfjsLib from "pdfjs-dist";
import { useRouter } from "next/router";
import axios from "axios";
import Feedback from "../../components/Documents/Comments";

interface ButtonWithIconProps {
  icon: React.ReactNode;
  onClick?: () => void;
}

const DocumentViewer: React.FC = () => {
  // const pdfUrl: string =
  //   "https://etutoring-storage.s3.amazonaws.com/documents/4e5fd223-89fd-47bd-a1ae-86fd04827e20-Git_Commit_Message_Standard.pdf";
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const [isInfoVisible, setIsInfoVisible] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const router = useRouter();
  const { id } = router.query;

  interface DocumentData {
    id: string;
    title: string;
    file_url: string;
  }

  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      axios
        .post("/api/documents/user", { page_number: 1, page_size: 10 })
        .then((response) => {
          const document = response.data.data.find((doc: DocumentData) => doc.id === id);
          if (document) {
            setDocumentData(document);
            setFileUrl(document.file_url);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching document:", error);
          setLoading(false);
        });
    }
  }, [id]);

  useEffect(() => {
    if (fileUrl) {
      // Load the PDF and get the number of pages
      pdfjsLib
        .getDocument(fileUrl)
        .promise.then((pdf) => {
          setNumPages(pdf.numPages);
        })
        .catch((error) => {
          console.error("Error loading PDF:", error);
        });

      // Fetch the file and calculate its size
      fetch(fileUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const sizeInBytes = blob.size;
          const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2); // Convert to MB
          setFileSize(`${sizeInMB} MB`);
        })
        .catch((error) => {
          console.error("Error fetching file size:", error);
        });
    }
  }, [fileUrl]);

  if (loading) return <p>Loading document...</p>;
  if (!fileUrl) return <p>No file found.</p>;

  const handleDownload = (): void => {
    fetch(fileUrl)
      .then((response) => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error("Network response was not ok.");
      })
      .then((blob) => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        // Extract filename from documentData if available
        const filename = documentData?.title || "document.pdf";
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(link.href);
      })
      .catch((error) => console.error("Failed to download file:", error));
  };

  const handleInfo = (): void => {
    setIsInfoVisible(true);
  };

  const handleCloseModal = (): void => {
    setIsInfoVisible(false);
  };

  const zoomIn = (): void => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 1.5));
  };

  const zoomOut = (): void => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.8));
  };

  const headingStyle: React.CSSProperties = {
    fontSize: "36px",
    color: "#000",
    fontWeight: "bold",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
    marginBottom: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1 style={headingStyle}>Document Details</h1>
      <div className="flex flex-row justify-center items-center">
        <div style={{ width: "60%", height: "80vh", overflow: "auto" }}>
          <Worker
            workerUrl={
              "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js"
            }
          >
            <div style={{ zoom: scale }}>
              <Viewer
                fileUrl={fileUrl}
                plugins={[pageNavigationPluginInstance]}
              />
            </div>
          </Worker>
        </div>
        <div className="flex flex-col justify-start items-center gap-2 absolute right-[20px] top-[25%] transform translate-y-[-50%]">
          <ButtonWithIcon
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          />
          <ButtonWithIcon icon={<InfoCircleOutlined />} onClick={handleInfo} />
          <ButtonWithIcon icon={<PlusOutlined />} onClick={zoomIn} />
          <ButtonWithIcon icon={<MinusOutlined />} onClick={zoomOut} />
        </div>

        {isInfoVisible && (
          <div style={modalOverlayStyle}>
            <div style={infoStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2 style={infoHeaderStyle}>
                  <strong>Information</strong>
                </h2>
                <button onClick={handleCloseModal} style={closeButtonStyle}>
                  <CloseOutlined />
                </button>
              </div>
              <p>
                <strong>Name:</strong> {documentData?.title || "Unknown"}
              </p>
              <p>
                <strong>Size:</strong> {fileSize ?? "Loading..."}
              </p>
              <p>
                <strong>Pages:</strong> {numPages ?? "Loading..."}
              </p>
              <p>
                <strong>URL:</strong>{" "}
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  {fileUrl}
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
      <Feedback />
    </div>
  );
};

const ButtonWithIcon: React.FC<ButtonWithIconProps> = ({ icon, onClick }) => (
  <button style={buttonStyle} onClick={onClick}>
    {icon}
  </button>
);

const buttonStyle: React.CSSProperties = {
  width: "45px",
  height: "45px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fff",
  border: "1px solid #ccc",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "20px",
  boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.15)",
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const infoStyle: React.CSSProperties = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  width: "400px",
  position: "relative",
  textAlign: "left",
};

const infoHeaderStyle: React.CSSProperties = {
  fontSize: "24px",
  color: "#333",
};

const closeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "none",
  border: "none",
  fontSize: "19px",
  cursor: "pointer",
};

export default DocumentViewer;
