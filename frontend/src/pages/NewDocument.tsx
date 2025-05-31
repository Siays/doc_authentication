import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { usePageTitles } from "../hooks/usePageTitle";
import DropzoneUploader from "../components/DropzoneUploader";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function NewDocument():React.ReactElement{
    usePageTitles("New Document", "New Document Page");
    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (uploadedFile && uploadedFile.type === "application/pdf") {
          setFile(uploadedFile);
        } else {
          alert("Please upload a PDF file.");
        }
      };

  return (
    <div className="flex p-8 space-x-8">
      {/* Left: PDF Preview */}
      <div className="w-1/2">
        <h2 className="text-xl font-semibold mb-2">New Document</h2>
        <p className="mb-2">Pdf Preview:</p>
        <div className="border rounded shadow">
          {file ? (
            <Document file={file} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
              {Array.from(new Array(numPages), (el, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} />
              ))}
            </Document>
          ) : (
            <div className="text-center p-10 text-gray-400">No file uploaded</div>
          )}
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-1/2 space-y-4">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="doc_owner_name"
            className="flex-1 p-2 border rounded"
          />
        </div>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="doc_owner_ic"
            className="w-1/2 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="doc_type"
            className="w-1/2 p-2 border rounded"
          />
        </div>
        <input
          type="text"
          placeholder="issuer_name"
          className="w-full p-2 border rounded"
        />
        <div className="flex items-center space-x-2">
          <input
            type="date"
            className="p-2 border rounded w-full"
            placeholder="issue_date"
          />
        </div>

        {/* File upload */}
        <div className="row-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Upload Profile Picture (Optional)
              </label>
              <DropzoneUploader
                onFileSelect={(file) => setValue("profileImage", file)}
              />
            </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button className="px-4 py-2 border rounded text-gray-700">Cancel</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

