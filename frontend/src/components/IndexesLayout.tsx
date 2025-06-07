import { type DocumentRecord } from '../types/sharedInterface'
import { MdSearch } from "react-icons/md";
import React, { useState } from "react";
import axiosClient from "../services/axiosClient";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import TableComponent from "../components/TableComponent";
import { usePageTitles } from "../hooks/usePageTitle";

interface IndexesLayoutProps {
  title: string;
  tabTitle: string;
  actionRender: (doc: DocumentRecord) => React.ReactNode;
}

const IndexesLayout: React.FC<IndexesLayoutProps> = ({ title, tabTitle, actionRender }) => {
    usePageTitles(title, tabTitle);
    const navigate = useNavigate();
    const [docOwnerIC, setDocOwnerIC] = useState("");
    const [docType, setDocType] = useState("");
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [icError, setIcError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
  
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;
  
    const isValidIC = (ic: string) => {
      return /^\d{6}-\d{2}-\d{4}$/.test(ic);
    };
  
    const fetchDocList = async (page = 0) => {
      setIsLoading(true);
      try {
        const response = await axiosClient.get("/get-document", {
          // continue to add pagination
          params: { owner_ic: docOwnerIC, doc_type: docType,
            page: page, limit: itemsPerPage
           },
        });
  
        setDocuments(response.data.documents);
        setTotal(response.data.total);
        setCurrentPage(page);
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
                onClick={() => fetchDocList(0)}
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
            <TableComponent
              documents={documents}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => {
                setCurrentPage(page);
                fetchDocList(page);
              }}
              actions={actionRender}
              total={total}
            />
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

export default IndexesLayout