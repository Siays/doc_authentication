import { usePageTitles } from "../../hooks/usePageTitle";
import { MdSearch } from "react-icons/md";
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactPaginate from 'react-paginate';
import axiosClient from "../../services/axiosClient";

export default function AuthenticateDocumentIndex(): React.ReactElement {
    usePageTitles("Authenticate Document - Main", "Authenticate Document Main");

    const [docOwnerIC, setDocOwnerIC] = useState("");
    const [docType, setDocType] = useState("");
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
  
    },[docOwnerIC, docType]);
  

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Filter inputs */}
      <div className="flex space-x-4 mb-4 items-end">
        <div className="w-3/10">
          <label className="block text-sm font-medium mb-1" htmlFor="docOwnerIC">
            Document Owner IC
          </label>
          <input
            id="docOwnerIC"
            type="text"
            placeholder="Enter IC"
            className="border px-3 py-2 w-full bg-blue-50"
            value={docOwnerIC}
            onChange={(e) => setDocOwnerIC(e.target.value)}
          />
        </div>

        <div className="w-4/10">
          <label className="block text-sm font-medium mb-1" htmlFor="docType">
            Document Type
          </label>
          <select
            id="docType"
            className="border px-3 py-2 w-full bg-blue-50 appearance-none pr-10"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          >
            <option value="">Select type</option>
            <option value="IC">IC</option>
            <option value="BRG_PENGESAHAN_BRN">BRG_PENGESAHAN_BRN</option>
          </select>      
        </div>

        <div className="ml-5 mb-2">
          {<MdSearch size={32} className="text-blue-500"/>} 
        </div>
      </div>

      <p className="font-semibold mb-2">Filtered list:</p>

      {/* Table */}
      <div className="border border-blue-400 rounded-md overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-blue-100 text-gray-700">
            <tr>
              <th className="p-3">Doc Type</th>
              <th className="p-3">Uploaded By</th>
              <th className="p-3">Uploaded Time</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => (
              <tr
                key={doc.id}
                className={index % 2 === 0 ? "bg-white" : "bg-blue-50"}
              >
                <td className="p-3">{doc.type}</td>
                <td className="p-3">{doc.uploadedBy}</td>
                <td className="p-3">{doc.time}</td>
                <td className="p-3 space-x-2">
                  <a href="#" className="text-blue-600 hover:underline">View</a>
                  <a href="#" className="text-blue-600 hover:underline">Authenticate</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Back button */}
      <div className="mt-6 flex justify-center">
        <button
          className="px-6 py-2 bg-white border border-gray-400 rounded hover:bg-gray-100"
          onClick={() => window.location.href = "/home-page"}
        >
          Back To Home
        </button>
      </div>
    </div>
  );
}
