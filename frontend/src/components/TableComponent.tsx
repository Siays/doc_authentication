import React, { useMemo } from "react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import { type DocumentRecord } from "../types/sharedInterface";

interface DocumentTableProps {
  documents: DocumentRecord[];
  currentPage: number;
  itemsPerPage: number;
  total: number;
  onPageChange: (selected: number) => void;
  actions: (doc: DocumentRecord) => React.ReactNode;
  customColumns?: {
    label: string;
    render: (doc: DocumentRecord) => React.ReactNode;
  }[];
}

const TableComponent: React.FC<DocumentTableProps> = ({
  documents,
  currentPage = 0,
  itemsPerPage = 10,
  total = 0,
  onPageChange,
  actions,
  customColumns,
}) => {
  return (
    <>
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full table-fixed text-left border-collapse">
          <thead>
            <tr>
              <th className="p-3 w-48">Doc Type</th>
              <th className="p-3 w-60">Owner Name</th>
              <th className="p-3 w-40">Owner IC</th>
              {customColumns ? (
                customColumns.map((col, i) => (
                  <th key={i} className="p-3 w-50">
                    {col.label}
                  </th>
                ))
              ) : (
                <>
                  <th className="p-3 w-40">Uploaded By</th>
                  <th className="p-3 w-50">Uploaded Date</th>
                </>
              )}
              <th className="p-3 w-48 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => (
              <tr
                key={doc.doc_record_id}
                className={index % 2 === 0 ? "bg-white" : "bg-blue-50"}
              >
                <td className="p-3">{doc.document_type}</td>
                <td className="p-3 ">{doc.doc_owner_name}</td>
                <td className="p-3 ">{doc.doc_owner_ic}</td>
                {customColumns ? (
                  customColumns.map((col, i) => (
                    <td key={i} className="p-3">
                      {col.render(doc)}
                    </td>
                  ))
                ) : (
                  <>
                    <td className="p-3">{doc.issuer_name}</td>
                    <td className="p-3">{doc.issue_date}</td>
                  </>
                )}
                <td className="p-3 space-x-10">{actions(doc)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4">
        <ReactPaginate
          forcePage={currentPage}
          previousLabel={"← Prev"}
          nextLabel={"Next →"}
          pageCount={Math.ceil(total / itemsPerPage)}
          onPageChange={({ selected }) => onPageChange(selected)}
          containerClassName="flex items-center space-x-2"
          pageClassName="px-3 py-1 border rounded cursor-pointer"
          activeClassName="bg-blue-500 text-white"
          previousClassName="px-3 py-1 border rounded cursor-pointer"
          nextClassName="px-3 py-1 border rounded cursor-pointer"
          disabledClassName="opacity-50 cursor-not-allowed"
        />
      </div>
    </>
  );
};

export default TableComponent;
