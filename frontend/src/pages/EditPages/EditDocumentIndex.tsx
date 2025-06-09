import React, { useState } from "react";
import { Link } from "react-router-dom";
import IndexesLayout from "../../components/IndexesLayout";
import axiosClient from "../../services/axiosClient";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

interface Document {
  doc_encrypted_id: string;
  // define an object(DocumentRecord in this case) that may have unknown or dynamic properties
  [key: string]: any;
}

export default function EditDocumentIndex(): React.ReactElement {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentRefreshFunction, setCurrentRefreshFunction] = useState<(() => void) | null>(null);

  const handleDelete = (doc: Document, refreshFn?: () => void) => {
    setSelectedDocument(doc);
    setCurrentRefreshFunction(refreshFn ? () => refreshFn : null);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (selectedDocument) {
      setIsLoading(true);
      try {
        const response = await axiosClient.delete(
          `/delete/${selectedDocument.doc_encrypted_id}`,
          {
            params: {
              acc_id: user!.id,
            },
          }
        );
        console.log(response);

        toast.success("Document deleted, notification sent to super user");
        setShowModal(false);
        setSelectedDocument(null);
        
        // Refresh the document list with the current refresh function
        if (currentRefreshFunction) {
          currentRefreshFunction();
        }
      } catch (err) {
        toast.error("Failed to delete document");
      } finally {
        setIsLoading(false);
        setCurrentRefreshFunction(null);
      }
    }
  };

  return (
    <>
      <IndexesLayout
        title="Edit Document - Main"
        tabTitle="Edit Document Main"
        actionRender={(doc, refreshDocuments) => (
          <div className="flex items-center space-x-4">
            <Link
              className="text-blue-600 hover:underline"
              to={`/edit-document/edit/${doc.doc_encrypted_id}`}
              state={{ document: doc }}
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(doc, refreshDocuments)}
              className="text-blue-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}        
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete this document? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}