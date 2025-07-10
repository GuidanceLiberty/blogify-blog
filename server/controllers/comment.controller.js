import { ObjectId } from "mongodb";
import url from 'url';
import { Comment } from '../models/Comment.js';
import { Post } from "../models/Post.js";
import { User } from "../models/User.js";


export const getComments = async(req, res) => {
    const parseUrl = url.parse(req.url);
    const query = parseUrl.query;
    const postId = req.params.post_id;
    const post_id = new ObjectId(postId);

    try {
        let limit = query.limit;
        if (limit = undefined){ limit = 50 }

        const comments = await Comment.find({ postId })
        .populate({
            path: "author",
            model: User,
            select: '_id name email photo'
        })        
        .sort({ createdAt: 'desc' })
        .limit(limit)
        .exec();

        if(!comments){
            return res.status(400).json({
                success: false, message: "No comments found for this post"
            })
        }
        res.status(200).json({
            success: true, message: "Comments found", comments
        })

    } catch (error) {
        return res.status(400).json({ 
            success: false, message: error.message
         });
    }
}

export const addComment = async(req, res) => {
    const { comment, user_id, post_id } = req.body;
    const userId = new ObjectId(user_id);
    const postId = new ObjectId(post_id);

    try {
        const post = await Post.findById(postId);
        if(!post){
            return res.status(400).json({
                success: false, message: "Post not found"
            })
        }

        const post_comment = await Comment.create(
            { postId, comment, author: user_id }
        );
        if(post_comment){
            const updatePost = await post.updateOne(
                { $push: { comments: { $each: [post_comment._id], $position: 0  } } }
            );

            if(updatePost){
                res.status(200).json({
                    success: true, message: "Comment posted successfully!"
                });
            }else{
                res.status(400).json({
                    success: false, message: "Fail to add comment to post"
                });
            }
        }
    } catch (error) {
        return res.status(400).json({ 
            success: false, message: error.message
         });
    }
}