import React from "react";
import IndexesLayout from "../../components/IndexesLayout";
import { Link } from "react-router-dom";

export default function AuthenticateDocumentIndex(): React.ReactElement {
  return (
    <IndexesLayout
      title="Authenticate Document - Main"
      tabTitle="Authenticate Document Main"
      actionRender={(doc) => (
        <>
          <a
            href={`/view/${doc.doc_encrypted_id}`}
            target="_blank"
            className="text-blue-600 hover:underline ml-5"
          >
            View
          </a>
          <Link
            className="text-blue-600 hover:underline ml-5"
            to={`/authenticate-document/upload/${doc.doc_encrypted_id}`}
            state={{ document: doc }}
          >
            Authenticate
          </Link>
        </>
      )}
    />
  );
}
