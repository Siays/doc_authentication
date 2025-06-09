import React, { useEffect, useState } from "react";
import { useFormValidation } from "../hooks/useFormValidation";
import { usePageTitles } from "../hooks/usePageTitle";
import axiosClient from "../services/axiosClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
  staffId: string;
  staffName: string;
  jobTitle: string;
  permission: "Super" | "Normal";
}

export default function CreateUser(): React.ReactElement {
  usePageTitles("Create User", "Create User Page");
  const navigate = useNavigate();
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [emailSearchTerm, setEmailSearchTerm] = useState("");

  const form = useFormValidation<FormState>(
    {
      email: "",
      password: "",
      confirmPassword: "",
      staffId: "",
      staffName: "",
      jobTitle: "",
      permission: "Normal",
    },
    {
      password: (val) =>
        val.length < 5 ? "Password must be at least 5 characters" : undefined,
      confirmPassword: (val) => {
        if (!val) return "Confirm Password is required";
        return undefined;
      },
    }
  );

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (emailSearchTerm.length > 2) {
        axiosClient
          .get("/available-staff-emails", { params: { search: emailSearchTerm } })
          .then((res) => setEmailSuggestions(res.data))
          .catch(() => setEmailSuggestions([]));
      } else {
        setEmailSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [emailSearchTerm]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = form.validateAll();
    if (!isValid) return;

    const formData = new FormData();
    formData.append("staff_id", form.values.staffId);
    formData.append("account_holder_name", form.values.staffName);
    formData.append("email", form.values.email);
    formData.append("password", form.values.password);
    formData.append("is_super", (form.values.permission === "Super").toString());

    try {
      await axiosClient.post("/create-user", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      form.reset();
      toast.success("User created successfully", { autoClose: 3000 });
      navigate("/home-page");
    } catch {
      toast.error("Failed to create user", { autoClose: 3000 });
    }
  };

  const inputClass =
    "mt-2 block w-full max-w-md rounded-md border px-3 py-2 shadow-sm outline outline-1 bg-white text-base text-gray-900 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm";

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-12">
        <div className="pb-12 border-b border-gray-900/10">
          {/* Email Input */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              Staff Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.values.email}
              onChange={(e) => {
                const val = e.target.value;
                form.handleChange("email", val);
                setEmailSearchTerm(val);
              }}
              onBlur={() =>
                form.validateField("email", form.values.email, (val) =>
                  emailSuggestions.includes(val)
                    ? undefined
                    : "Please select an email from the suggestions."
                )
              }
              className={inputClass}
            />
            {form.errors.email && (
              <p className="text-sm text-red-600 mt-1">{form.errors.email}</p>
            )}

            {emailSuggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full max-w-md border bg-white rounded shadow">
                {emailSuggestions.map((email) => (
                  <li
                    key={email}
                    onClick={() => {
                      form.setValues({ ...form.values, email });
                      form.validateField("email", email);
                      setEmailSuggestions([]);
                      axiosClient
                        .get("/staff-info", { params: { email } })
                        .then((res) =>
                          form.setValues({
                            ...form.values,
                            email,
                            staffId: res.data.staff_id,
                            staffName: res.data.full_name,
                            jobTitle: res.data.job_title,
                          })
                        );
                    }}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  >
                    {email}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Password */}
          <div className="mt-5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.values.password}
              onChange={(e) => form.handleChange("password", e.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
            {form.errors.password && (
              <p className="text-sm text-red-600 mt-1">{form.errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mt-5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={form.values.confirmPassword}
              onChange={(e) => form.handleChange("confirmPassword", e.target.value)}
              onBlur={() =>
                form.validateField("confirmPassword", form.values.confirmPassword, (val) =>
                  val !== form.values.password ? "Passwords do not match" : undefined
                )
              }
              className={inputClass}
              autoComplete="new-password"
            />
            {form.errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{form.errors.confirmPassword}</p>
            )}
          </div>

          {/* Permission */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-900">Permission</label>
            <div className="mt-2 flex gap-6">
              {["Super", "Normal"].map((role) => (
                <label key={role} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="permission"
                    value={role}
                    checked={form.values.permission === role}
                    onChange={() =>
                      form.handleChange("permission", role as FormState["permission"])
                    }
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Read-Only Staff Info */}
        <div className="pb-12 border-b border-gray-900/10">
          <h2 className="text-base font-semibold text-gray-900">Staff Info</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: "Staff ID", name: "staffId" },
              { label: "Staff Name", name: "staffName" },
              { label: "Job Title", name: "jobTitle" },
            ].map(({ label, name }) => (
              <div key={name}>
                <label htmlFor={name} className="block text-sm font-medium text-gray-900">
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  value={(form.values as any)[name]}
                  readOnly
                  className={`mt-2 block w-full max-w-md rounded-md border px-3 py-2 shadow-sm outline bg-gray-100 text-gray-500 cursor-not-allowed`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          onClick={() => navigate("/home-page")}
          className="text-sm font-semibold text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={Object.values(form.errors).some((e) => !!e)}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create
        </button>
      </div>
    </form>
  );
}
