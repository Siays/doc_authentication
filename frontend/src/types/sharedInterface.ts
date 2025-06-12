export interface DocumentRecord {
    doc_record_id: string;
    doc_encrypted_id: string;
    doc_owner_name: string;
    doc_owner_ic: string;
    document_type: string;
    issuer_id: number;
    issuer_name: string;
    issue_date: string;
    verification_url: string;
    is_deleted: boolean;
    deleted_by: string;
    deleted_by_name: string;
    deleted_at: string;
  }