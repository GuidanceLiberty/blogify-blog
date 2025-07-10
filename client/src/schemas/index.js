import * as yup from 'yup';

export const registerSchema = yup.object().shape({
    name: yup.string().min(5, "Mininum of 5 characters required").required("Name required"),
    email: yup.string().email("Email not valid").required("Email required"),
    password: yup.string().min(6, "Passwird require mininum of 6 characters").required("Password required")
});


export const loginSchema = yup.object().shape({
    email: yup.string().email("Email not valid").required("Email required"),
    password: yup.string().min(6, "Passwird require mininum of 6 characters").required("Password required")
});

export const categorySchema = yup.object().shape({
    name: yup.string().min(5, "Mininum of 5 characters required").required("Name required" ),
    description: yup.string().min(15, "Mininum of 15 characters required").required("Description required")
});

export const postSchema = yup.object().shape({
    title: yup.string().min(5, "Mininum of 5 characters required").required("Title required" ),
    body: yup.string().min(15, "Mininum of 15 characters required").required("Body required"),
    categories: yup.string().min(5, "Mininum of 5 characters required").required("Category is required" ),
    author: yup.string().min(24, "Mininum of 24 hexadecimal characters required").required("Author required" ),
});