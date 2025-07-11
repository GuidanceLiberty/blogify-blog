import { FaRegCalendarAlt } from 'react-icons/fa';
import userImg from '../../assets/images/user.png';

const Comments = ({ comments }) => {
  const img_path = process.env.REACT_APP_UPLOAD_URL;

  return (
    <section>
      {comments && comments?.comments?.map((comment) => {
        const author = comment?.author; // ✅ FIXED: use `author` not `user_id`
        const photoURL = author?.photo?.startsWith("http")
          ? author.photo
          : author?.photo
          ? `${img_path}${author.photo}`
          : userImg;

        return (
          <div className="comment-div" key={comment._id}>
            <div className="comment-user-info">
              <div className="user-img">
                <img src={photoURL} alt="user photo" className="w-10 h-10 rounded-full" />
              </div>

              <div className="user-info">
                <span>{author?.name || "Unknown User"}</span>

                <div className="flex items-center gap-1 !text-sm">
                  <FaRegCalendarAlt className="text-gray-400" />
                  {new Date(comment?.createdAt).getDate()}{" "}
                  {new Date(comment?.createdAt).toLocaleString("default", {
                    month: "long",
                  })}
                </div>
              </div>
            </div>

            <p className="comment-content">{comment?.comment}</p>
          </div>
        );
      })}
    </section>
  );
};

export default Comments;
