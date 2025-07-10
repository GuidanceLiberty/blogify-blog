import MainLayout from "../components/MainLayout"
import avatar from '../assets/images/user.png';
import useSWR from "swr";
import { useParams } from 'react-router-dom';

const Profile = () => {

  const URL = process.env.REACT_APP_BASE_URL;
  const UPLOAD_URL = process.env.REACT_APP_UPLOAD_URL;

  const userInfo = localStorage.getItem('user');
  const user = JSON.parse(userInfo);

  const params = useParams();
  const id = params.user_id;



  const fetcher = (...args) => fetch(...args, {headers: {'Authorization': `Bearer ${user.token}`}}).then((Response) => Response.json());
  const { data: posts, mutate, error } = useSWR(`${URL}/posts/user-posts/${id}?limit=2000`, fetcher);
  const { data: profile } = useSWR(`${URL}/auth/profile/${id}`, fetcher);
  //console.log("User  :: ", profile)

  let profilePic = UPLOAD_URL + profile?.data?.photo; 
  if(profilePic === UPLOAD_URL || profilePic.includes(null) || profilePic.includes(undefined)){ profilePic = avatar }

//    console.log("PIC : ", profilePic)






  return (
    <MainLayout>
        
        <section className="container mx-auto my-14 sm:flex-row md:flex sm:item-center md:justify-start items-center gap-24">
            <div className="profile-image sm:w-full md:w-5/7 flex justify-center text-center">
                <img src={profilePic} alt="" className="w-[50vw]" />
            </div>

            <table className={` w-full rounded-lg `}>
                <tbody className="">
                    <tr className={`whitespace-nowrap bg-gray-200 tracking-wider`} >
                        <td className="pr-5 py-2 text-lg font-semibold text-right border-r-2 border-gray-300"> Username </td>
                        <td className="pl-5 py-2 text-lg"> {profile?.data?.name} </td>
                    </tr> 
                    <tr className={`whitespace-nowrap tracking-wider`}>
                        <td className="pr-5 py-2 text-lg font-semibold text-right border-r border-gray-300"> Email </td>
                        <td className="pl-5 py-2 text-lg"> {profile?.data?.email} </td>
                    </tr>
                    <tr className={`whitespace-nowrap bg-gray-200 tracking-wider`} >
                        <td className="pr-5 py-2 text-lg font-semibold text-right border-r-2 border-gray-300"> Role </td>
                        <td className="pl-5 py-2 text-lg"> {profile?.data?.role} </td>
                    </tr> 
                    <tr className={`whitespace-nowrap tracking-wider`}>
                        <td className="pr-5 py-2 text-lg font-semibold text-right border-r border-gray-300"> Last Login on </td>
                        <td className="pl-5 py-2 text-lg"> 
                        <span>
                             {new Date(profile?.data?.createdAt).getDate()}{" "}
                                {new Date(profile?.data?.createdAt).toLocaleString("default", { month: "long", })}{", "}
                                {new Date(profile?.data?.createdAt).getFullYear()}
                        </span>
                        </td>
                    </tr>
                    <tr className={`whitespace-nowrap bg-gray-200 tracking-wider`} >
                        <td className="pr-5 py-2 text-lg font-semibold text-right border-r-2 border-gray-300"> No of Posts </td>
                        <td className="pl-5 py-2 text-lg"> 
                            <span>
                                {
                                    posts?.data?.length > 0 ? 
                                    posts?.data?.length : 0
                                }
                            </span>
                        </td>
                    </tr> 
                    <tr className={`whitespace-nowrap tracking-wider`}>
                        <td className="pr-5 py-2 text-lg font-semibold text-right border-r border-gray-300"> No of Liked Posts </td>
                        <td className="pl-5 py-2 text-lg"> 
                            <span>
                                {
                                    user?.likes?.length > 0 ?
                                    user?.likes?.length : 0
                                }
                            </span>
                        </td>
                    </tr>
                    <tr className={`whitespace-nowrap bg-gray-200 tracking-wider`} >
                        <td className="pr-5 py-2 text-lg font-semibold text-right border-r-2 border-gray-300"> No of Comments </td>
                        <td className="pl-5 py-2 text-lg"> 
                            <span>
                                {
                                    posts?.posts?.comments?.length > 0 ?
                                    posts?.posts?.comments?.length : 0
                                }
                            </span>
                        </td>
                    </tr> 
                    <tr className={`whitespace-nowrap tracking-wider`}>
                        <td className="pr-5 py-2 text-lg font-semibold text-right border-r border-gray-300"> Is verified </td>
                        <td className="pl-5 py-2 text-lg"> 
                            <span>
                                {
                                    profile?.data?.isVerified ? 
                                    <span className="yes-badge">Yes</span> : 
                                    <span className="no-badge">No</span>
                                }
                            </span>
                        </td>
                    </tr><tr className={`whitespace-nowrap bg-gray-200 tracking-wider`} >
                        <td className="pr-5 py-2 text-lg font-semibold text-right border-r-2 border-gray-300"> Joined on </td>
                        <td className="pl-5 py-2 text-lg"> 
                            <span>
                                {new Date(user?.createdAt).getDate()}{" "}
                                {new Date(user?.createdAt).toLocaleString("default", { month: "long", })}{", "}
                                {new Date(user?.createdAt).getFullYear()}
                            </span>
                        </td>
                    </tr> 
                </tbody>
            </table>


            <div className="profile-details flex flex-col w-full gap-y-4 text-lg px-10">
                

               
                
                
                
            </div>
        </section>

    </MainLayout>
  )
}

export default Profile