import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaImage, FaUnlockAlt, FaUserPlus } from "react-icons/fa";
import { useState } from "react";
import { useFormik } from "formik";
import { registerSchema } from "../schemas";
import toast from "react-hot-toast";
import axios from "axios";
import { Loader } from "lucide-react";

const Register = () => {
  const URL = process.env.REACT_APP_BASE_URL;
  const UPLOAD_URL = process.env.REACT_APP_UPLOAD_URL;
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [photoURL, setPhotoURL] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      setUploading(true);
      const res = await axios.post(`${UPLOAD_URL}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setPhotoURL(res.data.imageUrl);
      toast.success("Profile image uploaded");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values, actions) => {
    if (!photoURL) {
      toast.error("Please upload a profile photo.");
      return;
    }

    const payload = { ...values, photo: photoURL };

    try {
      const response = await fetch(`${URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await response.json();
      if (res.success) {
        toast.success(res.message);
        actions.resetForm();
        navigate("/verify-email");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Signup error");
      console.error("Signup error: ", error.message);
    }
  };

  const {
    values,
    touched,
    isSubmitting,
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
  } = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      photo: "",
    },
    validationSchema: registerSchema,
    onSubmit,
  });

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">Create New Account</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Fullname */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">
              <span className="flex items-center gap-2">
                <FaUserPlus /> Full Name <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your full name"
              className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.name && errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
              <span className="flex items-center gap-2">
                <FaEnvelope /> Email <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.email && errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700">
              <span className="flex items-center gap-2">
                <FaUnlockAlt /> Password <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.password && errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Profile Photo */}
          <div>
            <label htmlFor="photo" className="block text-sm font-medium mb-1 text-gray-700">
              <span className="flex items-center gap-2"><FaImage /> Profile Photo</span>
            </label>
            <input
              type="file"
              id="photo"
              accept=".png, .jpeg, .jpg, .gif"
              onChange={handleFileChange}
              className="w-full text-sm"
            />
            {file && (
              <img
                src={window.URL.createObjectURL(file)}
                alt="preview"
                className="mt-2 rounded-md w-20 h-20 object-cover"
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-primary-dark transition"
            disabled={isSubmitting || uploading}
          >
            {isSubmitting || uploading ? <Loader className="animate-spin" /> : "Sign Up"}
          </button>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Login now
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default Register;
