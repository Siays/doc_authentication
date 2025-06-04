import { useState, useEffect, useMemo } from "react";
import { usePageTitles } from "../hooks/usePageTitle";
import DropzoneUploader from "../components/DropzoneUploader";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import {
  baseInputClass,
  errorInputClass,
  unmodifiableInputClass,
  errorTextClass,
} from "../style/inputFieldStyle";
import { useNavigate } from "react-router-dom";
import axiosClient from "../services/axiosClient";
import { toast } from "react-toastify";
import { MdOutlineFileDownload } from "react-icons/md";
import axios from "axios";

type FormValues = {
  email: string;
  doc_owner_name: string;
  doc_owner_ic: string;
  doc_type: string;
  issuer_name: string;
  issue_date: string;
  pdf: File;
  issuer_id: bigint;
};

export default function NewDocument(): React.ReactElement {
  usePageTitles("New Document", "New Document Page");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const docType = ["IC", "BRG_PENGSESAHAN_BRN"];
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onTouched",
  });

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    formData.append("doc_owner_name", data.doc_owner_name);
    formData.append("doc_owner_ic", data.doc_owner_ic);
    formData.append("doc_type", data.doc_type);
    formData.append("issuer_name", data.issuer_name);
    formData.append("issue_date", data.issue_date);
    formData.append("file", data.pdf);
    formData.append("issuer_id", data.issuer_id.toString());

    try {
      setIsLoading(true);
      const response = await axiosClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setDownloadUrl(response.data.download_url);
      toast.success("File successfully processed. Ready for download.");
    } catch (err) {
      console.error("Upload failed", err);

      if (axios.isAxiosError(err)) {
        const msg =
        err.response?.data?.detail || "Failed to upload and process document.";
        toast.error(msg);
      }
    } finally{
      setIsLoading(false);
    }
  };

  const [hyphenError, setHyphenError] = useState("");

  function useBlobUrl(file: File | null) {
    return useMemo(() => {
      if (!file) return null;
      const url = URL.createObjectURL(file);
      return url;
    }, [file]);
  }

  const blobUrl = useBlobUrl(file);

  useEffect(() => {
    if (user?.name) {
      setValue("issuer_name", user.name);
    }
  }, [user, setValue]);

  useEffect(() => {
    if (user?.id) {
      setValue("issuer_id", user.id);
    }
  }, [user, setValue]);

  useEffect(() => {
    const today = new Date();
    setValue("issue_date", today.toISOString().split("T")[0]); // YYYY-MM-DD
  }, []);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  return (
    <>
      {/* spinner while fetching data from the db */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
            {/* PDF Preview */}
            <div className="w-full md:w-1/2">
              <label className="block mb-2 font-medium">PDF Preview:</label>
              <div className="border rounded shadow overflow-auto flex items-center justify-center">
                {file ? (
                  <div className="relative w-full pt-[141.42%]">
                    {" "}
                    {/* A4 aspect ratio */}
                    <iframe
                      src={`/pdfjs/web/viewer.html?file=${encodeURIComponent(
                        blobUrl ?? ""
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
                <div>
                  <label className="block mb-1 font-medium">
                    Document Owner Name
                  </label>
                  <input
                    type="text"
                    {...register("doc_owner_name", {
                      required: "Document owner name is required",
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: "Name must contain only letters and spaces",
                      },
                    })}
                    className={`${baseInputClass} block w-full  
                ${errors.doc_owner_name ? `${errorInputClass}` : ""}`}
                  />
                  {errors.doc_owner_name && (
                    <p className={`${errorTextClass}`}>
                      {errors.doc_owner_name.message}
                    </p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <label className="block mb-1 font-medium">
                      Document Owner IC
                    </label>
                    <input
                      type="text"
                      {...register("doc_owner_ic", {
                        required: "Document owner IC is required",
                        validate: (value) => {
                          if (!value) return "Document owner IC is required";
                          if (value.length < 14)
                            return "IC must be 14 characters (e.g. 123456-78-9012)";
                          if (!/^\d{6}-\d{2}-\d{4}$/.test(value))
                            return "Invalid IC format (format expected: 123456-78-9012)";
                          return true;
                        },
                      })}
                      onChange={(e) => {
                        let value = e.target.value;

                        // Manual hyphen error detection (runs while typing)
                        if (value.length === 7 && value[6] !== "-") {
                          setHyphenError(
                            "First hyphen should be after 6 digits (e.g. 123456-)"
                          );
                          value = value.slice(0, 6);
                        } else if (value.length === 10 && value[9] !== "-") {
                          setHyphenError(
                            "Second hyphen should be after 2 digits (e.g. 123456-78-)"
                          );
                          value = value.slice(0, 9);
                        } else if (value.length === 15) {
                          setHyphenError("IC should be 14 inputs only");
                          value = value.slice(0, 14);
                        } else {
                          setHyphenError("");
                        }

                        setValue("doc_owner_ic", value, {
                          shouldValidate: false,
                        });
                      }}
                      onBlur={() => {
                        setHyphenError("");
                        trigger("doc_owner_ic");
                      }}
                      className={`${baseInputClass} block w-full ${
                        errors.doc_owner_ic || hyphenError
                          ? `${errorInputClass}`
                          : ""
                      }`}
                    />

                    {/* Show live hyphen error */}
                    {hyphenError && (
                      <p className={`${errorTextClass}`}>{hyphenError}</p>
                    )}

                    {/* Show validation error from RHF only if no hyphen error */}
                    {errors.doc_owner_ic && !hyphenError && (
                      <p className={`${errorTextClass}`}>
                        {errors.doc_owner_ic.message}
                      </p>
                    )}
                  </div>

                  <div className="w-1/2">
                    <label className="block mb-1 font-medium">
                      Document Type
                    </label>
                    <select
                      className={`${baseInputClass} block w-full ${
                        errors.doc_type ? errorInputClass : ""
                      }`}
                      {...register("doc_type", {
                        required: "Document type is required",
                      })}
                    >
                      <option value="">Select Document Type</option>
                      {docType.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.doc_type && (
                      <p className={`${errorTextClass}`}>
                        {errors.doc_type.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Issuer Name</label>
                  <input
                    type="text"
                    readOnly
                    className={`${unmodifiableInputClass}`}
                    {...register("issuer_name")}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Issue Date</label>
                  <input
                    type="date"
                    readOnly
                    className={`${unmodifiableInputClass}`}
                    {...register("issue_date")}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Upload Document
                  </label>
                  <DropzoneUploader
                    onFileSelect={(selectedFile) => {
                      setFile(selectedFile);
                      setValue("pdf", selectedFile, { shouldValidate: true });
                      trigger("pdf");
                    }}
                    fileType={{ "application/pdf": [".pdf"] }}
                    message="Only PDF, max 1 file, cannot be empty"
                  />
                </div>

                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    className="flex flex-col items-center justify-center w-full h-[163px] border-2 border-blue-500 rounded text-blue-600 hover:bg-blue-50 transition-all"
                    // Remove the download attribute since we're handling it server-side
                  >
                    <div className="text-2xl mb-1">
                      <MdOutlineFileDownload size={25} />
                    </div>
                    <span className="mt-3 text-sm font-bold text-black">
                      Download Document
                    </span>
                  </a>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-x-6">
                <button
                  className="px-4 py-2 border rounded text-gray-700"
                  onClick={() => navigate("/home-page")}
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
