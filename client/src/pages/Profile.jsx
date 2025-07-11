import MainLayout from "../components/MainLayout";
import avatar from '../assets/images/user.png';
import useSWR from "swr";
import { useParams } from 'react-router-dom';

const Profile = () => {
  const URL = process.env.REACT_APP_BASE_URL;
  const UPLOAD_URL = process.env.REACT_APP_UPLOAD_URL;

  const userInfo = localStorage.getItem('user');
  const user = JSON.parse(userInfo);

  const { user_id } = useParams();

  const fetcher = (...args) =>
    fetch(...args, {
      headers: { Authorization: `Bearer ${user.token}` },
    }).then((res) => res.json());

  const { data: postsData } = useSWR(`${URL}/posts/user-posts/${user_id}?limit=2000`, fetcher);
  const { data: profileData } = useSWR(`${URL}/auth/profile/${user_id}`, fetcher);

  const profile = profileData?.data;
  const posts = postsData?.data || [];

  // 🖼️ Handle photo fallback
  const profilePic = profile?.photo
    ? (profile.photo.startsWith('http') ? profile.photo : `${UPLOAD_URL}${profile.photo}`)
    : avatar;

  // 🧮 Count total comments made on user's posts
  const totalComments = posts.reduce((sum, post) => sum + (post?.comments?.length || 0), 0);

  return (
    <MainLayout>
      <section className="container mx-auto my-14 sm:flex-row md:flex sm:item-center md:justify-start items-center gap-24">
        <div className="profile-image sm:w-full md:w-5/7 flex justify-center text-center">
          <img src={profilePic} alt="Profile" className="w-[50vw] rounded-full shadow-lg" />
        </div>

        <table className="w-full rounded-lg mt-6">
          <tbody>
            <tr className="bg-gray-200">
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">Username</td>
              <td className="pl-5 py-2">{profile?.name || "N/A"}</td>
            </tr>
            <tr>
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">Email</td>
              <td className="pl-5 py-2">{profile?.email || "N/A"}</td>
            </tr>
            <tr className="bg-gray-200">
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">Role</td>
              <td className="pl-5 py-2">{profile?.role || "N/A"}</td>
            </tr>
            <tr>
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">Last Login</td>
              <td className="pl-5 py-2">
                {profile?.lastLogin
                  ? new Date(profile.lastLogin).toLocaleDateString("default", { day: 'numeric', month: 'long', year: 'numeric' })
                  : "N/A"}
              </td>
            </tr>
            <tr className="bg-gray-200">
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">No of Posts</td>
              <td className="pl-5 py-2">{posts.length}</td>
            </tr>
            <tr>
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">No of Liked Posts</td>
              <td className="pl-5 py-2">{profile?.likes?.length || 0}</td>
            </tr>
            <tr className="bg-gray-200">
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">No of Comments</td>
              <td className="pl-5 py-2">{totalComments}</td>
            </tr>
            <tr>
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">Is Verified</td>
              <td className="pl-5 py-2">
                {profile?.isVerified
                  ? <span className="bg-green-200 text-green-700 px-2 py-1 rounded-full text-sm">Yes</span>
                  : <span className="bg-red-200 text-red-700 px-2 py-1 rounded-full text-sm">No</span>}
              </td>
            </tr>
            <tr className="bg-gray-200">
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">Joined on</td>
              <td className="pl-5 py-2">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("default", { day: 'numeric', month: 'long', year: 'numeric' })
                  : "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </MainLayout>
  );
};

export default Profile;
