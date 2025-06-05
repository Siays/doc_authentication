import { usePageTitles } from "../../hooks/usePageTitle";
import { MdSearch } from "react-icons/md";
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import ReactPaginate from "react-paginate";
import axiosClient from "../../services/axiosClient";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

interface DocumentRecord {
  doc_record_id: string;
  doc_encrypted_id: string;
  doc_owner_name: string;
  doc_owner_ic: string;
  document_type: string;
  issuer_id: number;
  issuer_name: string;
  issue_date: string;
  verification_url: string;
}

export default function AuthenticateDocumentIndex(): React.ReactElement {
  usePageTitles("Authenticate Document - Main", "Authenticate Document Main");
  const navigate = useNavigate();
  const [docOwnerIC, setDocOwnerIC] = useState("");
  const [docType, setDocType] = useState("");
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [icError, setIcError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const currentItems = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return documents.slice(start, start + itemsPerPage);
  }, [currentPage, documents]);

  const isValidIC = (ic: string) => {
    return /^\d{6}-\d{2}-\d{4}$/.test(ic);
  };

  const fetchDocList = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get("/get-document", {
        params: { owner_ic: docOwnerIC, doc_type: docType },
      });

      setDocuments(response.data);
      setCurrentPage(0);
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.detail || "Failed to fetch documents.";
        toast.error(msg);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* spinner while fetching data from the db */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div className="max-w-4xl mx-auto py-6">
        {/* Filter inputs */}
        <div className="flex flex-wrap gap-6 mb-6 items-start">
          {/* Document Owner IC */}
          <div className="flex-1 min-w-[250px] max-w-[250px]">
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="docOwnerIC"
            >
              Document Owner IC
            </label>
            <div className="space-y-1">
              <input
                id="docOwnerIC"
                type="text"
                className={`w-full rounded-md border px-3 py-2 shadow-sm outline bg-white outline-gray-300 focus:outline-indigo-600 ${
                  icError ? "outline-red-500 border-red-300" : ""
                }`}
                value={docOwnerIC}
                onChange={(e) => {
                  let value = e.target.value;
                  if (value.length > 14) value = value.slice(0, 14);

                  if (value.length === 7 && value[6] !== "-") {
                    setIcError(
                      "First hyphen should be after 6 digits (e.g. 123456-)"
                    );
                    value = value.slice(0, 6);
                  } else if (value.length === 10 && value[9] !== "-") {
                    setIcError(
                      "Second hyphen should be after 2 digits (e.g. 123456-78-)"
                    );
                    value = value.slice(0, 9);
                  } else if (value.length === 14 && !isValidIC(value)) {
                    setIcError("IC should follow format: 123456-78-9012");
                  } else {
                    setIcError("");
                  }

                  setDocOwnerIC(value);
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value.length !== 14) {
                    setIcError(
                      "Number of inputs doesn't match the expected IC format"
                    );
                  } else if (!isValidIC(value)) {
                    setIcError("Invalid IC format");
                  }
                }}
              />
              <p className="text-sm text-red-600">{icError || "\u00A0"}</p>
            </div>
          </div>

          {/* Document Type */}
          <div className="flex-1 min-w-[250px] max-w-[350px]">
            <label className="block text-sm font-medium mb-1" htmlFor="docType">
              Document Type
            </label>
            <div className="space-y-1">
              <select
                id="docType"
                className="w-full rounded-md border px-3 py-2 shadow-sm outline outline-gray-300 focus:outline-indigo-600"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                <option value="">Select type</option>
                <option value="IC">IC</option>
                <option value="BRG_PENGESAHAN_BRN">BRG_PENGESAHAN_BRN</option>
              </select>
              {/* Add invisible spacer to match IC field height */}
              <div className="text-sm">&nbsp;</div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-center pt-6">
            <button
              onClick={fetchDocList}
              disabled={!isValidIC(docOwnerIC)}
              className={`${
                !isValidIC(docOwnerIC) ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title={
                !isValidIC(docOwnerIC)
                  ? "Enter a valid IC to search"
                  : "Search documents"
              }
            >
              <MdSearch size={35} className="text-blue-500" />
            </button>
          </div>
        </div>

        {/* Table */}
        {documents.length > 0 && (
          <>
            <div className="overflow-x-auto border rounded-md">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-3">Doc Type</th>
                    <th className="p-3">Owner Name</th>
                    <th className="p-3">Owner IC</th>
                    <th className="p-3">Uploaded By</th>
                    <th className="p-3">Uploaded Time</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((doc, index) => (
                    <tr
                      key={doc.doc_record_id}
                      className={index % 2 === 0 ? "bg-white" : "bg-blue-50"}
                    >
                      <td className="p-3">{doc.document_type}</td>
                      <td className="p-3 ">{doc.doc_owner_name}</td>
                      <td className="p-3 ">{doc.doc_owner_ic}</td>
                      <td className="p-3 ">{doc.issuer_name}</td>
                      <td className="p-3 ">{doc.issue_date}</td>
                      <td className="p-3 space-x-10">
                        <a
                          href={`/view/${doc.doc_encrypted_id}`}
                          className="text-blue-600 hover:underline ml-5"
                          target="_blank"
                        >
                          View
                        </a>
                        <Link
                          to={`/authenticate-document/upload/${doc.doc_encrypted_id}`}
                          state={{ document: doc }}
                          className="text-blue-600 hover:underline"
                        >
                          Authenticate
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-4">
              <ReactPaginate
                previousLabel={"← Prev"}
                nextLabel={"Next →"}
                pageCount={Math.ceil(documents.length / itemsPerPage)}
                onPageChange={({ selected }) => setCurrentPage(selected)}
                containerClassName="flex items-center space-x-2"
                pageClassName="px-3 py-1 border rounded cursor-pointer"
                activeClassName="bg-blue-500 text-white"
                previousClassName="px-3 py-1 border rounded cursor-pointer"
                nextClassName="px-3 py-1 border rounded cursor-pointer"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          </>
        )}

        {/* Back button */}
        <div className="mt-6 flex justify-end">
          <button
            className="px-6 py-2 bg-white border border-gray-400 rounded hover:bg-gray-100"
            onClick={() => navigate("/home-page")}
          >
            Back To Home
          </button>
        </div>
      </div>
    </>
  );
}
