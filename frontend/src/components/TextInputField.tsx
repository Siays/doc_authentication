import React from "react";

interface Props {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  error?: string;
  placeholder?: string;
  readOnly?: boolean;
  className?: string; // optional: input element customization
  wrapperClassName?: string; // ✅ NEW: controls outer wrapper width/layout
}

export const TextInputField: React.FC<Props> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  type = "text",
  error,
  placeholder,
  readOnly = false,
  className = "",
  wrapperClassName = "", // ✅ default to none
}) => {
  const inputStyles =
    "mt-2 block w-full rounded-md border px-3 py-2 shadow-sm outline outline-1";

  const colorStyles = readOnly
    ? "bg-gray-100 text-gray-500 outline-gray-300 cursor-not-allowed"
    : "bg-white outline-gray-300 focus:outline-indigo-600";

  const errorStyles = error ? "outline-red-500 border-red-300" : "";

  return (
    <div className={wrapperClassName}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`${inputStyles} ${colorStyles} ${errorStyles} ${className}`}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
