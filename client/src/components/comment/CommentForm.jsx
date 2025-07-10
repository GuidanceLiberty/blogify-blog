import { FaComment } from 'react-icons/fa'

const CommentForm = ({handleComment, comment, setComment}) => {
  return (
    <section>
      <form onSubmit={handleComment} className="flex flex-col my-10 w-full">
            <label htmlFor="comment" className="label justify-between"> 
                <div className="label !text-lg"> <FaComment /> Comment </div>
                <button type="submit" className="btn-purple-full">Post Comment</button>
            </label>

            <textarea rows={3} id="comment" placeholder="Leave your comment here"
                className={`placeholder:text-[#bec6d3] placeholder:font-light text-input-reg !font-light`}
                value={comment} onChange={(e) => setComment(e.target.value)}
            ></textarea>
        </form>
    </section>
  )
}

export default CommentForm
