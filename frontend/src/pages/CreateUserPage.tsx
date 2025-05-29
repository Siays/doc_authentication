import React, { useEffect, useState } from "react";
import { useFormValidation } from "../hooks/useFormValidation";
import { TextInputField } from "../components/TextInputField";
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

  // Initialize form with useFormValidation
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

  // Email suggestion fetching
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (emailSearchTerm.length > 2) {
        axiosClient
          .get("/available-staff-emails", {
            params: { search: emailSearchTerm },
          })
          .then((res) => {
            setEmailSuggestions(res.data);
          })
          .catch((err) => {
            console.error("Failed to fetch suggestions:", err);
            setEmailSuggestions([]);
          });
      } else {
        setEmailSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [emailSearchTerm]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const isValid = form.validateAll();
    if (!isValid) return;

    const formData = new FormData();
    formData.append("staff_id", form.values.staffId.toString());
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
      // console.log("User created, showing toast...");
      toast.success("User created successfully", { autoClose: 3000 });
    } catch (error) {
      toast.error("Failed to create user", { autoClose: 3000 });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-12">
        <div className="pb-12 border-b border-gray-900/10">
          {/* Email Input with Suggestions */}
          <div className="relative">
  <TextInputField
    label="Staff Email"
    name="email"
    value={form.values.email}
    onChange={(value) => {
      form.handleChange("email", value);
      setEmailSearchTerm(value);
    }}
    onBlur={() =>
      form.validateField("email", form.values.email, (val) =>
        emailSuggestions.includes(val)
          ? undefined
          : "Please select an email from the suggestions."
      )
    }
    error={form.errors.email}
    wrapperClassName="w-full max-w-md"
  />

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
              .then((res) => {
                form.setValues({
                  ...form.values,
                  email,
                  staffId: res.data.staff_id,
                  staffName: res.data.full_name,
                  jobTitle: res.data.job_title,
                });
              });
          }}
          className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
        >
          {email}
        </li>
      ))}
    </ul>
  )}
</div>


{/* Password Input */}
<TextInputField
  label="Password"
  name="password"
  type="password"
  value={form.values.password}
  onChange={(val) => form.handleChange("password", val)}
  error={form.errors.password}
  wrapperClassName="mt-5 w-full max-w-md"
/>

{/* Confirm Password */}
<TextInputField
  label="Confirm Password"
  name="confirmPassword"
  type="password"
  value={form.values.confirmPassword}
  onChange={(val) => form.handleChange("confirmPassword", val)}
  onBlur={() =>
    form.validateField("confirmPassword", form.values.confirmPassword, (val) =>
      val !== form.values.password ? "Passwords do not match" : undefined
    )
  }
  error={form.errors.confirmPassword}
  wrapperClassName="mt-5 w-full max-w-md"
/>

          {/* Add confirm password field here if needed */}

          {/* Permission Radio */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-900">
              Permission
            </label>
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

        {/* Read-only Staff Info */}
        <div className="pb-12 border-b border-gray-900/10">
          <h2 className="text-base font-semibold text-gray-900">Staff Info</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <TextInputField
              label="Staff ID"
              name="staffId"
              value={form.values.staffId}
              onChange={() => {}}
              error=""
              placeholder=""
              readOnly={true}
            />
            <TextInputField
              label="Staff Name"
              name="staffName"
              value={form.values.staffName}
              onChange={() => {}}
              error=""
              placeholder=""
              readOnly={true}
            />
            <TextInputField
              label="Job Title"
              name="jobTitle"
              value={form.values.jobTitle}
              onChange={() => {}}
              error=""
              placeholder=""
              readOnly={true}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
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
