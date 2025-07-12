import MainLayout from "../components/MainLayout";
import avatar from "../assets/images/user.png";
import { useParams } from "react-router-dom";
import useSWR from "swr";

const Profile = () => {
  const URL = process.env.REACT_APP_BASE_URL;
  const { user_id } = useParams();
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const fetcher = (url) =>
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());

  const { data, error, isLoading } = useSWR(
    `${URL}/auth/profile/${user_id}`,
    fetcher
  );

  const profile = data?.data;

  if (isLoading)
    return (
      <MainLayout>
        <p>Loading...</p>
      </MainLayout>
    );
  if (error || !profile)
    return (
      <MainLayout>
        <p>Profile not found</p>
      </MainLayout>
    );

  const profilePic = profile.photo?.startsWith("http")
    ? profile.photo
    : avatar;

  return (
    <MainLayout>
      <section className="container mx-auto my-14 flex flex-col md:flex-row items-center gap-10 md:gap-24">
        <div className="profile-image w-60 h-60 sm:w-72 sm:h-72 rounded-full overflow-hidden shadow-xl border-4 border-primary">
          <img
            src={profilePic}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        <table className="w-full md:w-3/5 rounded-lg mt-6">
          <tbody>
            <tr className="bg-gray-200">
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">Username</td>
              <td className="pl-5 py-2">{profile.name}</td>
            </tr>
            <tr>
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">Email</td>
              <td className="pl-5 py-2">{profile.email}</td>
            </tr>
            <tr className="bg-gray-200">
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">Role</td>
              <td className="pl-5 py-2">{profile.role || "User"}</td>
            </tr>
            <tr>
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">Last Login</td>
              <td className="pl-5 py-2">
                {profile.lastLogin
                  ? new Date(profile.lastLogin).toLocaleString()
                  : "N/A"}
              </td>
            </tr>
            <tr className="bg-gray-200">
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">No of Posts</td>
              <td className="pl-5 py-2">{profile.totalPosts}</td>
            </tr>
            <tr>
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">No of Liked Posts</td>
              <td className="pl-5 py-2">{profile.likes?.length || 0}</td>
            </tr>
            <tr className="bg-gray-200">
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">No of Comments</td>
              <td className="pl-5 py-2">{profile.totalComments}</td>
            </tr>
            <tr>
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">Is Verified</td>
              <td className="pl-5 py-2">
                {profile.isVerified ? (
                  <span className="bg-green-200 text-green-700 px-2 py-1 rounded-full text-sm">Yes</span>
                ) : (
                  <span className="bg-red-200 text-red-700 px-2 py-1 rounded-full text-sm">No</span>
                )}
              </td>
            </tr>
            <tr className="bg-gray-200">
              <td className="pr-5 py-2 font-semibold text-right border-r-2 border-gray-300">Joined on</td>
              <td className="pl-5 py-2">
                {new Date(profile.createdAt).toLocaleDateString()}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </MainLayout>
  );
};

export default Profile;
