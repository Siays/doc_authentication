import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../services/axiosClient";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { usePageTitles } from "../hooks/usePageTitle";
import axios, { isAxiosError } from "axios";
import { MdSearch } from "react-icons/md";
import TableComponent from "../components/TableComponent";
import { type DocumentRecord } from "../types/sharedInterface";

export default function RecoverDocument(): React.ReactElement {
    usePageTitles("Recover Document", "Recover Document Page");
    const { user } = useAuth();
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const navigate = useNavigate();
    const [docOwnerIC, setDocOwnerIC] = useState("");
    const [docType, setDocType] = useState("");
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [icError, setIcError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;
  
    const toggleSelect = (id: string) => {
      setSelectedDocs((prev) =>
        prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
      );
      console.log(selectedDocs);
    };

    const isValidIC = (ic: string) => {
      return /^\d{6}-\d{2}-\d{4}$/.test(ic);
    };
  
    const fetchDocList = async (page = currentPage) => {    
      setIsLoading(true);
      try {
        const response = await axiosClient.get("/get-soft-deleted-document", {
          params: { 
            owner_ic: docOwnerIC || "", 
            doc_type: docType || "",
            page: page, 
            limit: itemsPerPage
          },
        });

        const { documents: fetchedDocs, total: fetchedTotal } = response.data;
        
        // Check if current page is empty but there are documents available
        if (fetchedDocs.length === 0 && fetchedTotal > 0 && page > 0) {
          // Calculate the last valid page (0-indexed)
          const lastValidPage = Math.max(0, Math.ceil(fetchedTotal / itemsPerPage) - 1);
          
          // Fetch the last valid page instead
          const fallbackResponse = await axiosClient.get("/get-soft-deleted-document", {
            params: { 
              owner_ic: docOwnerIC || "", 
              doc_type: docType || "",
              page: lastValidPage, 
              limit: itemsPerPage
            },
          });
          
          setDocuments(fallbackResponse.data.documents);
          setTotal(fallbackResponse.data.total);
          setCurrentPage(lastValidPage);
        } else {
          setDocuments(fetchedDocs);
          setTotal(fetchedTotal);
          setCurrentPage(page);
        }
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

    const confirmRecover = async () => {
      setIsLoading(true);
      try{
        const response = await axiosClient.post("/recover-documents", {
            encrypted_doc_ids: selectedDocs,  
            account_id: String(user?.id),      
        })
        toast.success(response.data.message);
        
        setSelectedDocs([]);
        fetchDocList(0);
      }catch(err){
        console.log(err);
        
        if (axios.isAxiosError(err)){
          toast.error(err.response?.data?.detail || "Unknown error");
        }
        
      }finally{
        setIsLoading(false);
      }
    }

    useEffect(() => {
      fetchDocList(0);
    }, [])
  
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
              actions={(doc) => (
                <div className="flex justify-center items-center h-full">
                <input
                type="checkbox"
                checked={selectedDocs.includes(doc.doc_encrypted_id)}
                onChange={() => toggleSelect(doc.doc_encrypted_id)}
                
              />
              </div>
              )}
              total={total}
              customColumns={[
                {
                  label: "Deleted By",
                  render: (doc) => doc.deleted_by_name || "-",
                },
                {
                  label: "Deleted Date",
                  render: (doc) => {
                    if (!doc.deleted_at) return "-";
                    const date = new Date(doc.deleted_at);
                    return new Intl.DateTimeFormat("en-MY", {
                      dateStyle: "medium",
                    }).format(date);
                  },
                },
              ]}
            />
          )}
  
          {/* Back button */}
          <div className="mt-6 flex gap-x-6 justify-end">
            <button
              className="px-4 py-2 bg-white border border-gray-400 rounded hover:bg-gray-100"
              onClick={() => navigate("/home-page")}
            >
              Back To Home
            </button>

            <button
              disabled = {selectedDocs.length == 0}
              onClick={confirmRecover}
              className={`${
                selectedDocs.length == 0 ? "rounded text-white px-4 py-2 bg-gray-400 cursor-not-allowed"
                 : "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              }`}
            >
              Recover
            </button>
          </div>
        </div>
      </>
    );
}