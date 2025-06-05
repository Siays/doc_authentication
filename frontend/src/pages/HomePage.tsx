import { useEffect, useState } from "react";
import { usePageTitles } from "../hooks/usePageTitle";
import { FaPlus, FaEdit , FaFilter} from "react-icons/fa";
import { MdOutlineDocumentScanner  } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axiosClient from "../services/axiosClient";
import axios from "axios";
import { toast } from "react-toastify";

interface DocumentRecord {
  doc_record_id: string;
  doc_encrypted_id: string,
  doc_owner_name: string;
  doc_owner_ic: string;
  document_type: string;
  issuer_id: number;
  issuer_name: string;
  issue_date: string;
  verification_url: string;
}

export default function HomePage() {
  usePageTitles("Home", "Home Page");
  const { user } = useAuth();
  const [recentDocs, setRecentDocs] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecentDocs = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get("/get-processed-docs", {
        params: {issuer_id: user!.id}
      });
      setRecentDocs(response.data);
    } catch (err) {
      console.error("Failed to fetch recent docs:", err);
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.detail || "Failed to fetch documents.";
        toast.error(msg);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(()=> { 
    fetchRecentDocs();
  },[user!.id])

  return (
    <>
    {/* spinner while fetching data from the db */}
    {isLoading && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )}
    <div className="p-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Action Buttons */}
        <div className="flex flex-col gap-6 w-full md:w-1/4">
          <ActionButton icon={<FaPlus size={35}/>} text="New Document"  route="/new-document"/>
          <ActionButton icon={<FaEdit size={35}/>} text="Edit Document" route="/edit-document"/>
          <ActionButton icon={<MdOutlineDocumentScanner size={35}/>} text="Authenticate Document" route="/authenticate-document"/>
        </div>

        {/* Right: Recent List Table */}
        <div className="w-full md:w-3/4">
          <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent list</h2>
          
          </div>
          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-3">Doc Type</th>
                  <th className="p-3">Owner Name</th>
                  <th className="p-3">Owner IC</th>
                  <th className="p-3">Uploaded By</th>
                  <th className="p-3">Uploaded Time</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((doc, index) => (
                  <tr key={index} className="odd:bg-blue-50">
                    <td className="p-3">{doc.document_type}</td>
                    <td className="p-3">{doc.doc_owner_name}</td>
                    <td className="p-3">{doc.doc_owner_ic}</td>
                    <td className="p-3">{doc.issuer_name}</td>
                    <td className="p-3">{doc.issue_date}</td>
                    <td className="p-3 space-x-10">
                      <a href={`/view/${doc.doc_encrypted_id}`} className="text-blue-600 hover:underline ml-5"
                      target="_blank">
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

// Helper Component for Action Buttons
function ActionButton({ icon, text, route }: { icon: React.ReactNode; text: string, route: string}) {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(route)}
      className="flex flex-col items-center justify-center w-full h-[163px] border-2 border-blue-500 rounded text-blue-600 hover:bg-blue-50 transition-all">
      <div className="text-2xl mb-1">{icon}</div>
      <span className="mt-3 text-sm font-bold text-black">{text}</span>
    </button>
  );
}
