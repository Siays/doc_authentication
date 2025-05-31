import DropzoneUploader from "../components/DropzoneUploader";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import axiosClient from "../services/axiosClient";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { usePageTitles } from "../hooks/usePageTitle";

type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  staffId: string;
  staffName: string;
  jobTitle: string;
  permission: "Super" | "Normal";
  profileImage: File;
  oldPassword: string;
};

export default function ModifyUserPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    getValues,
    trigger,
  } = useForm<FormValues>({
    mode: "onChange",
  });

  const password = watch("password");
  const oldPassword = watch("oldPassword");
  const confirmPassword = watch("confirmPassword");
  const profileImage = watch("profileImage");

  const isChanged =
    !!password ||
    !!oldPassword ||
    !!confirmPassword ||
    !!profileImage;


  const { user, fetchUser } = useAuth();
  const passwordFieldsFilled = oldPassword || password || confirmPassword;

  if (!user!.first_time_login) {
    usePageTitles("Update Account", "Update Account Page");
  }

  const getUserInfo = async () => {
    try {
      const resp = await axiosClient.get("/staff-info", {
        params: { email: user!.email },
      });
      
      setValue("email", user!.email);
      setValue("staffId", resp.data.staff_id);
      setValue("staffName", resp.data.full_name);
      setValue("jobTitle", resp.data.job_title);
      user!.is_super
        ? setValue("permission", "Super")
        : setValue("permission", "Normal");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user!.email) {
      getUserInfo();
    }
  }, [user!.email]);

  const onSubmit = async (data: FormValues) => {
    if (!isChanged) {
      toast.info("No changes detected.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      if (user!.first_time_login) {
        formData.append("password", data.password);
      }else{
        const passwordFieldsFilled = data.oldPassword || data.password || data.confirmPassword;
        if (passwordFieldsFilled){
          if (!data.oldPassword || !data.password || !data.confirmPassword){          
            toast.error("Please fill in all password fields");
            return;
          }

          try{
            await axiosClient.post("/check-old-password",
              new URLSearchParams({
                email: user!.email,
                password: data.oldPassword,
              }),
            {
              headers: {"Content-Type": "application/x-www-form-urlencoded"},
            });
          }catch(err){
            toast.error("Old password is incorrect");
            return;
          }
          formData.append("password", data.password);
        }

        }    

      if (data.profileImage) {
        formData.append("profile_picture", data.profileImage);
      }

      await axiosClient.post("/update-acc", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchUser();

      toast.success("Update successfully", { autoClose: 2000 });
      navigate("/home-page");
    } catch (err) {
      toast.error("Error occur", { autoClose: 2000 });
      console.log(err);
    }
  };

  return (
    <form
      className="space-y-12 bg-white p-8 rounded-md max-w-4xl mx-auto shadow"
      onSubmit={handleSubmit(onSubmit)}
    >
      {user!.first_time_login ? (
        <h1 className="text-2xl font-bold">Account Update - First Login</h1>
      ) : (
        ""
      )}

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
                <input
                  type="radio"
                  value="Super"
                  checked={watch("permission") === "Super"}
                  disabled
                />
                Super
              </label>
              <label className="inline-flex items-center gap-1 text-sm text-gray-700">
                <input
                  type="radio"
                  value="Normal"
                  checked={watch("permission") === "Normal"}
                  disabled
                />
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
      {user!.first_time_login ? (
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
                <p className="text-sm text-red-600 mt-1">
                  {errors.password.message}
                </p>
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
                <p className="text-sm text-red-600 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Right column: file upload spans both rows */}
            <div className="row-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Upload Profile Picture (Optional)
              </label>
              <DropzoneUploader
                onFileSelect={(file) => setValue("profileImage", file)}
                message = "Only JPG or PNG, max 1 file"
                  fileType = {
                  {
                    "image/jpeg": [".jpg", ".jpeg"],
                    "image/png": [".png"],
                  }
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold">Editable</h2>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Row 1: Old Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Old Password
              </label>
              <input
                type="password"
                {...register("oldPassword", {
                  validate: (val) => {
                    const { password, confirmPassword } = getValues();
                    if ((password || confirmPassword) && !val) {
                      return "Old password is required";
                    }
                    return true;
                  },
                })}
                className={`mt-2 block w-full rounded-md border px-3 py-2 shadow-sm outline outline-1 bg-white outline-gray-300 focus:outline-indigo-600 ${
                  errors.oldPassword ? "outline-red-500 border-red-300" : ""
                }`}
                onBlur={() => trigger(["password", "confirmPassword"])}
              />
              {errors.oldPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.oldPassword.message}
                </p>
              )}
            </div>

            {/* Upload spans 2 rows */}
            <div className="row-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Upload Profile Picture (Optional)
              </label>
              <DropzoneUploader
                onFileSelect={(file) => setValue("profileImage", file)}
                message ="Only JPG or PNG, max 1 file"
                fileType = {
                  {
                    "image/jpeg": [".jpg", ".jpeg"],
                    "image/png": [".png"],
                  }
                }
              />
            </div>

            {/* Row 2: New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900">
                New Password
              </label>
              <input
                type="password"
                {...register("password", {
                  minLength: { value: 5, message: "Minimum 5 characters" },
                  validate: (val) => {
                    const { oldPassword, confirmPassword } = getValues();
                    if ((oldPassword || confirmPassword) && !val) {
                      return "Password is required";
                    }
                    return true;
                  },
                })}
                className={`mt-2 block w-full rounded-md border px-3 py-2 shadow-sm outline outline-1 bg-white outline-gray-300 focus:outline-indigo-600 ${
                  errors.password ? "outline-red-500 border-red-300" : ""
                }`}
                onBlur={() => trigger(["oldPassword", "confirmPassword"])}
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Row 3: Confirm Password (no col 2) */}
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Confirm New Password
              </label>
              <input
                type="password"
                {...register("confirmPassword", {
                  validate: (val) => {
                    const { oldPassword, password } = getValues();
                    if ((oldPassword && password) && !val) {
                      return "Please confirm your new password";
                    }
                    if (passwordFieldsFilled && val !== password) {
                      return "Passwords do not match";
                    }
                    return true;
                  },
                })}
                className={`mt-2 block w-full rounded-md border px-3 py-2 shadow-sm outline outline-1 bg-white outline-gray-300 focus:outline-indigo-600 ${
                  errors.confirmPassword ? "outline-red-500 border-red-300" : ""
                }`}
                onBlur={() => trigger(["oldPassword", "password"])}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )} 


<div className="mt-6 flex items-center justify-end gap-x-6">
  {/* Cancel Button (for non-first time login only) */}
  {
        user!.first_time_login ? " " : 
        <button
        type="button"
        onClick={() => navigate("/home-page")}
        className="text-sm font-semibold text-gray-900"
      >
        Cancel
      </button>
        
      }
       

         {/* Confirm Button (not allow to submit if no changes)*/}
        <button
  type="submit"
  className="rounded-md bg-indigo-600 px-6 py-2 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={!isChanged}
>
  Confirm
</button>
      </div>
    

    </form>
  );
}
