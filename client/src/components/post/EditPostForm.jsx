import { useFormik } from "formik";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCubes, FaFeather, FaFeatherAlt, FaFileAlt, FaImage } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import { postSchema } from "../../schemas";
import { Loader } from "lucide-react";
import axios from "axios";

const EditPostForm = () => {
  const URL = process.env.REACT_APP_BASE_URL;
  const user = JSON.parse(localStorage.getItem("user"));
  const user_id = user?._id;
  const { slug: post_slug } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);

  const fetcher = (...args) =>
    fetch(...args, { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json());

  const { data: allCategories } = useSWR(`${URL}/categories`, fetcher);
  const { data: post } = useSWR(`${URL}/posts/${post_slug}`, fetcher);

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
    const uploadedUrl = await handleUpload();
    const payload = { ...values, photo: uploadedUrl || values.photo };

    try {
      const response = await fetch(`${URL}/posts/${post_slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const res = await response.json();
      if (res.success) {
        toast.success(res.message);
        actions.resetForm();
        await mutate(`${URL}/posts/${post_slug}`); // ✅ refetch post detail
        navigate("/");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Error updating post");
    }
  };

  const initialFormData = {
    title: post?.data?.title || "",
    body: post?.data?.body || "",
    categories: post?.data?.categories?._id || post?.data?.categories || "",
    photo: post?.data?.photo || "",
    author: user_id,
  };

  const formik = useFormik({
    initialValues: initialFormData,
    enableReinitialize: true,
    validationSchema: postSchema,
    onSubmit,
  });

  const { values, touched, isSubmitting, errors, handleBlur, handleChange, handleSubmit } = formik;

  return (
    <section className="post-form !h-[90%]">
      <div className="w-full max-w-lg mx-auto">
        <h1 className="font-roboto text-[1.3rem] font-light text-center text-primary mb-8">Edit Post Form</h1>
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

          {/* Upload New Photo */}
          <div className="flex flex-col mb-6 w-full">
            <label htmlFor="photo" className="label"><FaImage /> Upload New Photo</label>
            <input type="file" accept=".png,.jpg,.jpeg,.gif" className="text-input-reg" onChange={handleFileChange} />
            {values.photo && !file && <img src={values.photo} alt="Current" className="w-28 h-20 mt-2 object-cover rounded" />}
          </div>

          <button type="submit" className="btn-dark-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader className="animate-spin" /> : <span className="flex items-center gap-2"><FaFeatherAlt size={12} /> Update Post</span>}
          </button>
        </form>
      </div>
    </section>
  );
};

export default EditPostForm;
