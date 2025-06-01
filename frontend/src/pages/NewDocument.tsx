import { useState, useEffect } from "react";
import { usePageTitles } from "../hooks/usePageTitle";
import DropzoneUploader from "../components/DropzoneUploader";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "react-hook-form";

type FormValues = {
  email: string;
  doc_owner_name: string;
  doc_owner_ic: string;
  doc_type: string;
  issuer_name: string;
  issue_date: string;
  pdf: File;
};

export default function NewDocument(): React.ReactElement {
  usePageTitles("New Document", "New Document Page");
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const docType = ["IC", "BRG_PENGSESAHAN_BRN"];

  const {
    register,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onTouched",
  });

  useEffect(() => {
    if (user?.name) {
      setValue("issuer_name", user.name);
    }
  }, [user, setValue]);

  return (
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
                    URL.createObjectURL(file)
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
                className={`mt-2 block w-full rounded-md border px-3 py-2 shadow-sm outline outline-1 bg-white outline-gray-300 focus:outline-indigo-600 ${
                  errors.doc_owner_name ? "outline-red-500 border-red-300" : ""
                }`}
              />
              {errors.doc_owner_name && (
                <p className="text-sm text-red-600 mt-1">
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
                      if (value.length < 14)
                        return "IC must be 14 characters (e.g. 123456-78-9012)";
                      if (value[6] !== "-" || value[9] !== "-")
                        return "Hyphens must be in the correct position";
                      if (!/^\d{6}-\d{2}-\d{4}$/.test(value))
                        return "Invalid IC format";
                      return true;
                    },
                  })}
                  onChange={(e) => {
                    const value = e.target.value;
                    setValue("doc_owner_ic", value);
                    trigger("doc_owner_ic"); // This will call the validate above
                  }}
                  className={`mt-2 block w-full rounded-md border px-3 py-2 shadow-sm outline outline-1 bg-white outline-gray-300 focus:outline-indigo-600 ${
                    errors.doc_owner_ic ? "outline-red-500 border-red-300" : ""
                  }`}
                />
                {errors.doc_owner_ic && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.doc_owner_ic.message}
                  </p>
                )}
              </div>

              <div className="w-1/2">
                <label className="block mb-1 font-medium">Document Type</label>
                <select
                  className="w-full p-2 border rounded bg-white"
                  {...register("doc_type")}
                >
                  <option value="">Select Document Type</option>
                  {docType.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">Issuer Name</label>
              <input
                type="text"
                readOnly
                className="w-full p-2 border rounded bg-gray-100 text-gray-500"
                {...register("issuer_name")}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Issue Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                {...register("issue_date")}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Upload Document</label>
              <DropzoneUploader
                onFileSelect={(selectedFile) => {
                  setValue("pdf", selectedFile);
                  setFile(selectedFile);
                }}
                fileType={{ "application/pdf": [".pdf"] }}
                message="Only PDF, max 1 file"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button className="px-4 py-2 border rounded text-gray-700">
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
