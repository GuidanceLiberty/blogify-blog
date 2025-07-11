import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import url from "url";
import { Post } from "../models/Post.js";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { postSchema } from "../schema/Index.js";

export const getPosts = async (req, res) => {
  const parseUrl = url.parse(req.url, true);
  const query = parseUrl.query;
  try {
    let limit = query.limit;
    if (limit === undefined) {
      limit = 100;
    }

    const posts = await Post.find()
      .populate({ path: "author", model: User, select: "_id name email photo" })
      .populate({ path: "categories", model: Category, select: "_id name description" })
      .sort({ createdAt: "desc" })
      .limit(limit)
      .exec();

    if (!posts) {
      return res.status(400).json({ success: false, message: "No post found" });
    }
    res.status(200).json({ success: true, message: "Records found", posts });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const createPost = async (req, res) => {
  const { title, body, categories, photo, author } = req.body;
  const slug = title.toLowerCase().replace(/\s+/g, "-");

  const { error } = postSchema.validate({ title, slug, body, categories, author });
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const postExists = await Post.findOne({ title });
    if (postExists) {
      return res.status(400).json({ success: false, message: "Post already exists" });
    }

    const newPost = new Post({ title, slug, body, categories, photo, author });
    await newPost.save();

    return res.status(200).json({ success: true, message: "Post created successfully", post: newPost });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPost = async (req, res) => {
  const slug = req.params.slug;
  try {
    const post = await Post.findOne({ slug })
      .populate({ path: "author", model: User, select: "_id name email photo" })
      .populate({ path: "categories", model: Category, select: "_id name description" });

    if (!post) {
      return res.status(400).json({ success: false, message: `No post record found` });
    }

    res.status(200).json({ success: true, message: `${post?.title} post found`, data: post });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSinglePost = async (req, res) => {
  const slug = req.params.slug;
  try {
    const post = await Post.findOne({ slug });
    if (!post) {
      return res.status(400).json({ success: false, message: `No post record found` });
    }
    res.status(200).json({ success: true, message: `${post?.title} post found`, data: post });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePost = async (req, res) => {
  const post_slug = req.params.slug;
  const { title, body, categories, photo, author } = req.body;

  try {
    const post = await Post.findOne({ slug: post_slug });
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const slug = title.toLowerCase().trim().replace(/\s+/g, "-");
    const cate_id = new mongoose.Types.ObjectId(categories);

    post.title = title;
    post.slug = slug;
    post.body = body;
    post.categories = cate_id;
    post.photo = photo;
    post.author = author;

    await post.save();

    return res.status(200).json({ success: true, message: "Post updated successfully!", updatedPost: post });
  } catch (error) {
    console.error("Update error:", error.message);
    return res.status(500).json({ success: false, message: "Server error while updating post" });
  }
};

export const deletePost = async (req, res) => {
  const slug = req.params.slug;
  try {
    const post = await Post.findOneAndDelete({ slug });
    if (!post) {
      return res.status(400).json({ success: false, message: `Failed to delete post record` });
    }
    res.status(200).json({ success: true, message: `Post deleted successfully`, data: post });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const likeUnlikePost = async (req, res) => {
  const { user_id, post_id } = req.body;
  const userId = new ObjectId(user_id);
  const postId = new ObjectId(post_id);

  try {
    let post = await Post.findById({ _id: postId });
    let user = await User.findById({ _id: userId });

    if (!post.likes.includes(user_id)) {
      await post.updateOne({ $push: { likes: { $each: [userId], $position: 0 } } });
      await user.updateOne({ $push: { likes: { $each: [postId], $position: 0 } } });
      return res.status(200).json({ success: true, message: "Post was liked!" });
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      await user.updateOne({ $pull: { likes: postId } });
      return res.status(200).json({ success: true, message: "Post was unliked!" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getLikedPosts = async (req, res) => {
  const parseUrl = url.parse(req.url, true);
  const user_id = req.params.user_id;
  const query = parseUrl.query;

  try {
    let limit = query.limit || 100;
    if (!user_id) {
      return res.status(400).json({ success: false, message: "User id is required!" });
    }

    const user = await User.findOne({ _id: user_id })
      .select("-password")
      .populate({
        path: "likes",
        model: Post,
        select: "_id title slug categories body photo createdAt",
        populate: [
          { path: "author", model: User, select: "_id name email photo" },
          { path: "categories", model: Category, select: "_id name" },
        ],
      })
      .sort({ createdAt: "desc" })
      .limit(limit)
      .exec();

    if (user) {
      res.status(200).json({ success: true, message: "User liked posts found!", data: user });
    } else {
      res.status(400).json({ success: false, message: "Failed to fetch user liked posts!" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getSearchPosts = async (req, res) => {
  const parseUrl = url.parse(req.url, true);
  const query = parseUrl.query;
  try {
    let limit = query.limit || 100;
    let q = query.q;

    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { slug: { $regex: q, $options: "i" } },
        { body: { $regex: q, $options: "i" } },
      ],
    })
      .populate({ path: "author", model: User, select: "_id name email photo" })
      .populate({ path: "categories", model: Category, select: "_id name description" })
      .sort({ createdAt: "desc" })
      .limit(limit)
      .exec();

    if (!posts) {
      return res.status(400).json({ success: false, message: "No post found" });
    }

    res.status(200).json({ success: true, message: "Records found", posts });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
