import { useState, useEffect, useMemo } from "react";
import { usePageTitles } from "../../hooks/usePageTitle";
import DropzoneUploader from "../../components/DropzoneUploader";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../services/axiosClient";
import { toast } from "react-toastify";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function AuthenticateUploadPage(): React.ReactElement | null {
  usePageTitles("Authenticate Document - Upload", "Authenticate Document Page");
  const location = useLocation();
  const { document } = location.state || {};

  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("encrypted_doc_id", document!.doc_encrypted_id);
      formData.append("file", file!);
      const response = await axiosClient.post("/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const responseStatus = response.data.status;

      if (responseStatus === "valid") {
        toast.success(response.data.message);
        setStatus(true);
      } else {
        toast.error(response.data.message);
        setStatus(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  //   function useBlobUrl(file: File | null) {
  //     return useMemo(() => {
  //       if (!file) return null;
  //       const url = URL.createObjectURL(file);
  //       return url;
  //     }, [file]);
  //   }

  //   const blobUrl = useBlobUrl(file);

  useEffect(() => {
    if (!document) {
      toast.error("Invalid way of accessing this page");
      navigate("/home-page");
    }
  }, [document, navigate]);

  if (!document) return null;

  return (
    <>
      {/* spinner while fetching data from the db */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <form onSubmit={(e) => onSubmit(e)}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
            {/* PDF Preview */}
            <div className="w-full md:w-1/2">
              <label className="block mb-2 font-medium">
                PDF Preview (Document In System):
              </label>
              <div className="border rounded shadow overflow-auto flex items-center justify-center">
                {document?.verification_url ? (
                  <div className="relative w-full pt-[141.42%]">
                    {" "}
                    {/* A4 aspect ratio */}
                    <iframe
                      src={`/pdfjs/web/viewer.html?file=${encodeURIComponent(
                        document.verification_url ?? ""
                      )}`}
                      className="absolute top-0 left-0 w-full h-full rounded border"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-400 min-h-[600px] w-full flex items-center justify-center">
                    No file uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="w-full md:w-1/2 flex flex-col min-h-[600px]">
              <div className="flex-1 space-y-6 overflow-y-auto">
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <label className="block mb-1 font-medium">
                      Document Owner IC
                    </label>
                    <input
                      type="text"
                      readOnly
                      className="mt-2 block w-full rounded-md border px-3 py-2 shadow-sm outline outline-1 bg-gray-100 text-gray-500 outline-gray-300 cursor-not-allowed"
                      value={document!.doc_owner_ic}
                    />
                  </div>

                  <div className="w-1/2">
                    <label className="block mb-1 font-medium">
                      Document Type
                    </label>
                    <input
                      className="mt-2 block w-full rounded-md border px-3 py-2 shadow-sm outline outline-1 bg-gray-100 text-gray-500 outline-gray-300 cursor-not-allowed"
                      readOnly
                      value={document!.document_type}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Upload Document (With QR) To Authenticate
                  </label>
                  <DropzoneUploader
                    onFileSelect={(selectedFile) => {
                      setFile(selectedFile);
                    }}
                    fileType={{ "application/pdf": [".pdf"] }}
                    message="Only PDF, max 1 file, cannot be empty"
                  />
                </div>

                {status !== null && (
                  <div className="flex items-center space-x-2">
                    <label className="block font-medium">
                      Authenticate Status:
                    </label>
                    {status ? (
                      <p className="text-green-500 font-bold text-lg">Valid</p>
                    ) : (
                      <p className="text-red-500 font-bold text-lg">Invalid</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-x-6">
                <button
                  className="px-4 py-2 border rounded text-gray-700"
                  onClick={() => {
                    setStatus(null); // clear status & potentially any other states
                    setFile(null);
                    navigate("/home-page", { replace: true });
                  }}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded text-white transition
                    ${
                      file
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  disabled={!file}
                  type="submit"
                >
                  Authenticate
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
