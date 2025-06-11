import { useState, useEffect, useMemo } from "react";
import { usePageTitles } from "../../hooks/usePageTitle";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../services/axiosClient";
import { toast } from "react-toastify";

import axios from "axios";
import {
  baseInputClass,
  errorInputClass,
  unmodifiableInputClass,
  errorTextClass,
} from "../../style/inputFieldStyle";

type FormValues = {
  email: string;
  doc_owner_name: string;
  doc_owner_ic: string;
  document_type: string;
  issuer_name: string;
  issue_date: string;
  issuer_id: string;
};

export default function EditDocument(): React.ReactElement {
  usePageTitles("Edit Document", "Edit Document Page");
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onTouched",
  });

  const location = useLocation();
  const { document } = location.state || {};
  const navigate = useNavigate();
  const docType = ["IC", "BRG_PENGESAHAN_BRN"];
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<FormValues> | null>(
    null
  );
  const watchedValues = watch([
    "doc_owner_name",
    "doc_owner_ic",
    "document_type",
  ]);

  const getChangedFields = () => {
    const currentValues = getValues();
    const changedFields: Partial<FormValues> = {};

    const editableKeys: (keyof FormValues)[] = [
      "doc_owner_name",
      "doc_owner_ic",
      "document_type",
    ];

    for (const key of editableKeys) {
      const currentValue = currentValues[key];
      const originalValue = document?.[key as keyof typeof document];

      if (currentValue !== originalValue) {
        changedFields[key] = currentValue;
      }
    }

    return changedFields;
  };

  const onSubmit = async () => {
    const changedData = getChangedFields();

    try {
      setIsLoading(true);
      await axiosClient.post(
        `/check-conflict/${document.doc_encrypted_id}`,
        changedData
      );

      await axiosClient.patch(
        `/edit/${document.doc_encrypted_id}`,
        changedData,
        {
          params: { account_id: user?.id },
        }
      );

      toast.success("Document record update successfully.");

      if (changedData.doc_owner_name) {
        setValue("doc_owner_name", changedData.doc_owner_name);
      }
      if (changedData.doc_owner_ic) {
        setValue("doc_owner_ic", changedData.doc_owner_ic);
      }
      if (changedData.document_type) {
        setValue("document_type", changedData.document_type);
      }
    } catch (err) {
      console.error("Failed to update the document record", err);

      if (axios.isAxiosError(err)) {
        if (err.response?.data.status === "soft_deleted_conflict") {
          setPendingData(changedData);
          setShowModal(true);
        }

        toast.error(err.response?.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const confirmUpdate = async () => {
    if (!pendingData) return;

    setIsLoading(true);

    try {
      await axiosClient.patch(
        `/edit/${document.doc_encrypted_id}`,
        {
          ...pendingData,
          status: "soft_delete_conflict",
        },
        {
          params: { account_id: user?.id },
        }
      );

      toast.success("Document record updated successfully.");
      setShowModal(false);

      if (pendingData.doc_owner_name)
        setValue("doc_owner_name", pendingData.doc_owner_name);
      if (pendingData.doc_owner_ic)
        setValue("doc_owner_ic", pendingData.doc_owner_ic);
      if (pendingData.document_type)
        setValue("document_type", pendingData.document_type);
    } catch (err) {
      console.log(err);
      toast.error("Failed to override document conflict.");
    } finally {
      setIsLoading(false);
      setPendingData(null);
    }
  };

  const [hyphenError, setHyphenError] = useState("");

  useEffect(() => {
    if (!document) return;

    if (document?.issuer_name) {
      setValue("issuer_name", document.issuer_name);
    }

    if (document?.issuer_id) {
      setValue("issuer_id", document.issuer_id);
    }

    if (document?.doc_owner_ic) {
      setValue("doc_owner_ic", document.doc_owner_ic);
    }

    if (document?.doc_owner_name) {
      setValue("doc_owner_name", document.doc_owner_name);
    }

    if (document?.document_type) {
      setValue("document_type", document.document_type);
    }

    if (document?.issue_date) {
      const isoDate = new Date(document.issue_date).toISOString().split("T")[0];
      setValue("issue_date", isoDate);
    }
  }, [document, setValue]);

  const isSpecifiedFieldsModified = useMemo(() => {
    const changed = getChangedFields();
    return Object.keys(changed).length > 0;
  }, [watchedValues[0], watchedValues[1], watchedValues[2], document]);

  return (
    <>
      {/* spinner while fetching data from the db */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
            {/* PDF Preview */}
            <div className="w-full md:w-1/2">
              <label className="block mb-2 font-medium">PDF Preview:</label>
              <div className="border rounded shadow overflow-auto flex items-center justify-center">
                {document?.verification_url ? (
                  <div className="relative w-full pt-[141.42%]">
                    {" "}
                    {/* A4 aspect ratio */}
                    <iframe
                      src={`/pdfjs/web/viewer.html?file=${encodeURIComponent(
                        document.verification_url ?? ""
                      )}`}
                      className="absolute top-0 left-0 w-full h-full rounded border"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-400 min-h-[600px] w-full flex items-center justify-center">
                    No file uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="w-full md:w-1/2 flex flex-col min-h-[600px]">
              <div className="flex-1 space-y-6 overflow-y-auto">
                <div>
                  <label className="block mb-1 font-medium">
                    Document Owner Name
                  </label>
                  <input
                    type="text"
                    {...register("doc_owner_name", {
                      required: "Document owner name is required",
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: "Name must contain only letters and spaces",
                      },
                    })}
                    className={`${baseInputClass} block w-full  
                ${errors.doc_owner_name ? `${errorInputClass}` : ""}`}
                  />
                  {errors.doc_owner_name && (
                    <p className={`${errorTextClass}`}>
                      {errors.doc_owner_name.message}
                    </p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <label className="block mb-1 font-medium">
                      Document Owner IC
                    </label>
                    <input
                      type="text"
                      {...register("doc_owner_ic", {
                        required: "Document owner IC is required",
                        validate: (value) => {
                          if (!value) return "Document owner IC is required";
                          if (value.length < 14)
                            return "IC must be 14 characters (e.g. 123456-78-9012)";
                          if (!/^\d{6}-\d{2}-\d{4}$/.test(value))
                            return "Invalid IC format (format expected: 123456-78-9012)";
                          return true;
                        },
                      })}
                      onChange={(e) => {
                        let value = e.target.value;

                        // Manual hyphen error detection (runs while typing)
                        if (value.length === 7 && value[6] !== "-") {
                          setHyphenError(
                            "First hyphen should be after 6 digits (e.g. 123456-)"
                          );
                          value = value.slice(0, 6);
                        } else if (value.length === 10 && value[9] !== "-") {
                          setHyphenError(
                            "Second hyphen should be after 2 digits (e.g. 123456-78-)"
                          );
                          value = value.slice(0, 9);
                        } else if (value.length === 15) {
                          setHyphenError("IC should be 14 inputs only");
                          value = value.slice(0, 14);
                        } else {
                          setHyphenError("");
                        }

                        setValue("doc_owner_ic", value, {
                          shouldValidate: false,
                        });
                      }}
                      onBlur={() => {
                        setHyphenError("");
                        trigger("doc_owner_ic");
                      }}
                      className={`${baseInputClass} block w-full ${
                        errors.doc_owner_ic || hyphenError
                          ? `${errorInputClass}`
                          : ""
                      }`}
                    />

                    {/* Show live hyphen error */}
                    {hyphenError && (
                      <p className={`${errorTextClass}`}>{hyphenError}</p>
                    )}

                    {/* Show validation error from RHF only if no hyphen error */}
                    {errors.doc_owner_ic && !hyphenError && (
                      <p className={`${errorTextClass}`}>
                        {errors.doc_owner_ic.message}
                      </p>
                    )}
                  </div>

                  <div className="w-1/2">
                    <label className="block mb-1 font-medium">
                      Document Type
                    </label>
                    <select
                      className={`${baseInputClass} block w-full ${
                        errors.document_type ? errorInputClass : ""
                      }`}
                      {...register("document_type", {
                        required: "Document type is required",
                      })}
                    >
                      <option value="">Select Document Type</option>
                      {docType.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.document_type && (
                      <p className={`${errorTextClass}`}>
                        {errors.document_type.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Issuer Name</label>
                  <input
                    type="text"
                    readOnly
                    className={`${unmodifiableInputClass}`}
                    {...register("issuer_name")}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Issue Date</label>
                  <input
                    type="date"
                    readOnly
                    className={`${unmodifiableInputClass}`}
                    {...register("issue_date")}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-x-6">
                <button
                  className="px-4 py-2 border rounded text-gray-700"
                  onClick={() => navigate("/home-page")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-white ${
                    isSpecifiedFieldsModified
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isSpecifiedFieldsModified}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Confirm Override</h2>
            <p className="mb-6">
              <strong>
                {pendingData?.doc_owner_ic
                  ? pendingData?.doc_owner_ic
                  : document.doc_owner_ic}
              </strong>{" "}
              already has{" "}
              <strong>
                {pendingData?.document_type
                  ? pendingData?.document_type
                  : document.document_type}
              </strong>{" "}
              exists in soft deleted state. Replacing this will permanently delete the soft-deleted document.
              <span className="text-red-600 font-semibold">
              {" "}This action cannot be undone
              </span>
              .
              <br />
              <br />
              Are you sure you want to proceed?

             
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
                onClick={confirmUpdate}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
                disabled={isLoading}
              >
                {isLoading ? "Replacing..." : "Proceed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
