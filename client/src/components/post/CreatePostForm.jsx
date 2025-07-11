import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCubes, FaFeather, FaFeatherAlt, FaFileAlt, FaImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { postSchema } from "../../schemas";
import { Loader } from "lucide-react";
import useSWR from "swr";

const CreatePostForm = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();
  const [file, setFile] = useState(null);

  const fetcher = (...args) =>
    fetch(...args, { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json());

  const { data: allCategories } = useSWR(`${URL}/categories`, fetcher);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(`${URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Image uploaded");
      return res.data?.imageUrl; // ✅ cloudinary imageUrl
    } catch (err) {
      toast.error("Upload failed");
      return null;
    }
  };

  const onSubmit = async (values, actions) => {
    const uploadedPhotoUrl = await handleUpload();

    try {
      const response = await fetch(`${URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ ...values, photo: uploadedPhotoUrl }),
      });

      const res = await response.json();
      if (res.success) {
        toast.success(res.message);
        actions.resetForm();
        navigate(`/`);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Error occurred while creating post");
    }
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      body: "",
      categories: "",
      photo: "",
      author: user._id,
    },
    validationSchema: postSchema,
    onSubmit,
  });

  const { values, touched, isSubmitting, errors, handleBlur, handleChange, handleSubmit } = formik;

  return (
    <section className="post-form !h-[90%]">
      <div className="w-full max-w-lg mx-auto">
        <h1 className="font-roboto text-[1.3rem] font-light text-center text-primary mb-8">New Post Form</h1>
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="flex flex-col mb-6 w-full">
            <label htmlFor="title" className="label">
              <FaFeather />
              <span>Title <span className="req">*</span></span>
              {touched.title && errors.title && <p className="form-error">{errors.title}</p>}
            </label>
            <input type="text" id="title" className="text-input-reg" {...formik.getFieldProps("title")} />
          </div>

          {/* Body */}
          <div className="flex flex-col mb-6 w-full">
            <label htmlFor="body" className="label">
              <FaFileAlt />
              <span>Body <span className="req">*</span></span>
              {touched.body && errors.body && <p className="form-error">{errors.body}</p>}
            </label>
            <textarea rows={2} id="body" className="text-input-reg" {...formik.getFieldProps("body")} />
          </div>

          {/* Category */}
          <div className="flex flex-col mb-6 w-full">
            <label htmlFor="categories" className="label">
              <FaCubes />
              <span>Category <span className="req">*</span></span>
              {touched.categories && errors.categories && <p className="form-error">{errors.categories}</p>}
            </label>
            <select id="categories" className="text-input-reg" {...formik.getFieldProps("categories")}>
              <option value="">Select Category</option>
              {allCategories?.data.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Upload Photo */}
          <div className="flex flex-col mb-6 w-full">
            <label htmlFor="photo" className="label"><FaImage /> Upload Post Image</label>
            <input type="file" accept=".png,.jpg,.jpeg,.gif" className="text-input-reg" onChange={handleFileChange} />
          </div>

          <button type="submit" className="btn-dark-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader className="animate-spin" /> : <span className="flex items-center gap-2"><FaFeatherAlt size={12} /> Create Post</span>}
          </button>
        </form>
      </div>
    </section>
  );
};

export default CreatePostForm;
