import DropzoneUploader from "../components/DropzoneUploader";
import { TextInputField } from "../components/TextInputField";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import axiosClient from "../services/axiosClient";
import { useEffect } from "react";

type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  staffId: string;
  staffName: string;
  jobTitle: string;
  permission: "Super" | "Normal";
  profileImage: FileList;
};

export default function ModifyUserPage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onChange",
  });
  
  const password = watch("password");
  const { user } = useAuth();
  
  const getUserInfo = async () => {
    try{
      const resp = await axiosClient.get("/staff-info", 
        {params: {email: user!.email}
      })
      setValue("email", user!.email);
      setValue("staffId", resp.data.staff_id);
      setValue("staffName", resp.data.full_name);
      setValue("jobTitle", resp.data.job_title);
      user!.is_super ? setValue("permission", "Super") : setValue("permission", "Normal");
    }catch(err){
      console.log(err);
    }
  };

  useEffect(() => {
    if (user!.email) {
      getUserInfo();
    }
  }, [user!.email]);
  

  return (
    <form className="space-y-12 bg-white p-8 rounded-md max-w-4xl mx-auto shadow">
      <h1 className="text-2xl font-bold">Account Update - First Login</h1>

      {/* Staff Info Section */}
      <div className="pb-12 border-b border-gray-900/10">
  <h2 className="text-lg font-semibold">Staff Info</h2>
  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
    
    {/* Staff ID */}
    <div>
      <label className="block text-sm font-medium text-gray-900">
        Staff Id
      </label>
      <input
        type="text"
        readOnly
        {...register("staffId")}
        className="mt-2 block w-full rounded-md border px-3 py-2 shadow-sm outline outline-1 bg-gray-100 text-gray-500 outline-gray-300 cursor-not-allowed"
      />
    </div>

    {/* Staff Email */}
    <div>
      <label className="block text-sm font-medium text-gray-900">
        Staff Email
      </label>
      <input
        type="text"
        readOnly
        {...register("email")}
        className="mt-2 block w-full rounded-md border px-3 py-2 shadow-sm outline outline-1 bg-gray-100 text-gray-500 outline-gray-300 cursor-not-allowed"
      />
    </div>

    {/* Permission */}
    <div>
      <label className="block text-sm font-medium text-gray-900">
        Permission
      </label>
      <div className="mt-2 flex gap-4">
        <label className="inline-flex items-center gap-1 text-sm text-gray-700">
          <input type="radio" value="Super" checked={watch("permission") === "Super"} disabled />
          Super
        </label>
        <label className="inline-flex items-center gap-1 text-sm text-gray-700">
          <input type="radio" value="Normal" checked={watch("permission") === "Normal"} disabled />
          Normal
        </label>
      </div>
    </div>

    {/* Staff Name */}
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-900">
        Staff Name
      </label>
      <input
        type="text"
        readOnly
        {...register("staffName")}
        className="mt-2 block w-full rounded-md border px-3 py-2 shadow-sm outline outline-1 bg-gray-100 text-gray-500 outline-gray-300 cursor-not-allowed"
      />
    </div>

    {/* Job Title */}
    <div>
      <label className="block text-sm font-medium text-gray-900">
        Job Title
      </label>
      <input
        type="text"
        readOnly
        {...register("jobTitle")}
        className="mt-2 block w-full rounded-md border px-3 py-2 shadow-sm outline outline-1 bg-gray-100 text-gray-500 outline-gray-300 cursor-not-allowed"
      />
    </div>

  </div>
</div>


      {/* Editable Section */}
      <div>
        <h2 className="text-lg font-semibold">Editable</h2>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: password inputs */}
          <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900">
    New Password*
  </label>
  <input
    type="password"
    {...register("password", {
      required: "Password is required",
      minLength: { value: 5, message: "Minimum 5 characters" },
    })}
    className={`mt-2 block w-full rounded-md border px-3 py-2 shadow-sm outline outline-1 bg-white outline-gray-300 focus:outline-indigo-600 ${
      errors.password ? "outline-red-500 border-red-300" : ""
    }`}
  />
  {errors.password && (
    <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
  )}
            
            {/* Confirm Password */}
  <label className="block text-sm font-medium text-gray-900">
    Confirm Password*
  </label>
  <input
    type="password"
    {...register("confirmPassword", {
      required: "Please confirm your password",
      validate: (val) =>
        val === password || "Passwords do not match",
    })}
    className={`mt-2 block w-full rounded-md border px-3 py-2 shadow-sm outline outline-1 bg-white outline-gray-300 focus:outline-indigo-600 ${
      errors.confirmPassword ? "outline-red-500 border-red-300" : ""
    }`}
  />
  {errors.confirmPassword && (
    <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
  )}
          </div>

          {/* Right column: file upload spans both rows */}
          <div className="row-span-2">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Upload Profile Picture (Optional)
            </label>
            <DropzoneUploader />
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-6 py-2 text-white font-semibold hover:bg-indigo-500"
        >
          Confirm
        </button>
      </div>
    </form>
  );
}
