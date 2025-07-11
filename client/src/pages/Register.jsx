import { Link, useNavigate } from "react-router-dom";
import authBG from "../assets/images/auth-bg.jpg";
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
    formData.append("image", selectedFile); // must match backend field

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
      toast.error("Please upload a profile photo first.");
      return;
    }

    const payload = {
      ...values,
      photo: photoURL,
    };

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
    <main className="login-div">
      <div className="auth-left">
        <img src={authBG} alt="auth background" />
        <div className="auth-form !h-[95%]">
          <div className="w-full max-w-sm mx-auto">
            <h1 className="font-roboto text-2xl font-light tracking-medium text-center text-primary mb-8">
              Create New Account
            </h1>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col mb-6 w-full">
                <label htmlFor="name" className="label">
                  <FaUserPlus />
                  <span>
                    FullName <span className="req">*</span>
                  </span>
                  {touched.name && errors.name && (
                    <p className="form-error">{errors.name}</p>
                  )}
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter Fullname"
                  className="text-input-reg"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              <div className="flex flex-col mb-6 w-full">
                <label htmlFor="email" className="label">
                  <FaEnvelope />
                  <span>
                    Email <span className="req">*</span>
                  </span>
                  {touched.email && errors.email && (
                    <p className="form-error">{errors.email}</p>
                  )}
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter Email"
                  className="text-input"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              <div className="flex flex-col mb-6 w-full">
                <label htmlFor="password" className="label">
                  <FaUnlockAlt />
                  <span>
                    Password <span className="req">*</span>
                  </span>
                  {touched.password && errors.password && (
                    <p className="form-error">{errors.password}</p>
                  )}
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter Password"
                  className="text-input"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              <div className="flex flex-col mb-6 w-full">
                <label htmlFor="photo" className="label">
                  <FaImage /> Profile Photo
                </label>
                <input
                  type="file"
                  id="photo"
                  accept=".png, .jpeg, .jpg, .gif"
                  className="text-input-reg"
                  onChange={handleFileChange}
                />
                {file && (
                  <img
                    src={window.URL.createObjectURL(file)} // ✅ fixed here
                    alt="preview"
                    className="mt-2 rounded-md w-20 h-20 object-cover"
                  />
                )}
              </div>

              <Link
                to="/forget-password"
                className="text-sm text-primary mb-4 block text-right"
              >
                Forgot password?
              </Link>

              <button
                type="submit"
                className="btn-dark-full"
                disabled={isSubmitting || uploading}
              >
                {isSubmitting || uploading ? (
                  <Loader className="animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">Sign Up</span>
                )}
              </button>

              <p className="text-sm font-semibold text-[#5a7184] mt-4 text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-primary">
                  Login now
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
