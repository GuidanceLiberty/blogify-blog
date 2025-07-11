import { ObjectId } from "mongodb";
import url from 'url';
import { Comment } from '../models/Comment.js';
import { Post } from "../models/Post.js";
import { User } from "../models/User.js";

// ✅ GET COMMENTS CONTROLLER
export const getComments = async (req, res) => {
  const parseUrl = url.parse(req.url, true);
  const query = parseUrl.query;
  const postId = req.params.post_id;

  try {
    let limit = parseInt(query.limit) || 50;

    const comments = await Comment.find({ postId })
      .populate({
        path: "author",
        model: "User",
        select: '_id name email photo',
      })
      .sort({ createdAt: 'desc' })
      .limit(limit)
      .exec();

    if (!comments || comments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No comments found yet",
        comments: []
      });
    }

    res.status(200).json({
      success: true,
      message: "Comments found",
      comments
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ ADD COMMENT CONTROLLER
export const addComment = async (req, res) => {
  const { comment, user_id, post_id } = req.body;

  const userId = new ObjectId(user_id);
  const postId = new ObjectId(post_id);

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const newComment = new Comment({
      postId,
      comment,
      author: userId,
    });

    await newComment.save();

    // ✅ Populate the author field to return complete author info
    await newComment.populate({
      path: "author",
      model: "User",
      select: "_id name email photo",
    });

    // ✅ Push comment ID into the post's comments array
    await post.updateOne({
      $push: { comments: { $each: [newComment._id], $position: 0 } }
    });

    return res.status(200).json({
      success: true,
      message: "Comment posted successfully!",
      data: newComment
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
