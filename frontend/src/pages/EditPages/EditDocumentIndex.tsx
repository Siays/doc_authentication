import React from "react";
import { Link } from "react-router-dom";
import IndexesLayout from "../../components/IndexesLayout";

export default function EditDocumentIndex(): React.ReactElement {
  return (
    <IndexesLayout
      title="Edit Document - Main"
      tabTitle="Edit Document Main"
      actionRender={(doc) => (
        <>        
          <Link
            className="text-blue-600 hover:underline ml-5"
            to={`/authenticate-document/upload/${doc.doc_encrypted_id}`}
            state={{ document: doc }}
          >
            Edit
          </Link>

          <a
            href={`/view/${doc.doc_encrypted_id}`}
            target="_blank"
            className="text-blue-600 hover:underline ml-5"
          >
            Delete
          </a>
        </>
      )}
    />
  );
}
