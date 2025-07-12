import { FaCube } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { categorySchema } from '../../schemas';

const CategoryForm = ({ mutate, user }) => {
  const URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();

  const onSubmit = async (values, actions) => {
    try {
      const response = await fetch(`${URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(values),
      });

      const res = await response.json();
      if (res.success) {
        toast.success(res.message);
        mutate();
        actions.resetForm();
        navigate(`/categories`);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Category creation error:", error);
      toast.error("Error occurred while creating category");
    }
  };

  // ✅ Always call hooks at top-level, never inside conditions
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
      description: "",
    },
    validationSchema: categorySchema,
    onSubmit,
  });

  return (
    <div className="category-section">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col mb-6 w-full">
          <label htmlFor="name" className="label">
            <FaCube />
            <span>
              Name <span className="req">*</span>
            </span>
            {touched.name && errors.name && (
              <p className="form-error">{errors.name}</p>
            )}
          </label>
          <input
            type="text"
            id="name"
            placeholder="Enter category name"
            className="placeholder:text-[#bec6d3] placeholder:font-light text-input-reg"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>

        <div className="flex flex-col mb-8 w-full">
          <label htmlFor="description" className="label">
            <FaCube />
            <span>
              Description <span className="req">*</span>
            </span>
            {touched.description && errors.description && (
              <p className="form-error">{errors.description}</p>
            )}
          </label>
          <textarea
            rows={4}
            id="description"
            placeholder="Enter description"
            className="placeholder:text-[#bec6d3] placeholder:font-light text-input"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>

        <button type="submit" className="btn-dark-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader className="animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              <span>Create Category</span>
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default CategoryForm;
