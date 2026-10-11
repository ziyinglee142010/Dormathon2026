import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";
import { useParams } from "react-router-dom";
import api from "../api";
import BreadCrumb from "../components/BreadCrumb";
import  FileUpload  from "../components/FileUpload";
import { SimpleEditor } from "../components/tiptap-templates/simple/simple-editor";
import Spinner from "../components/Spinner";
import EmotionBarChart from "../components/view-session/EmotionBarChart";
import { Label, TextInput, Button } from "flowbite-react";
import VideoPlayer from "../components/VideoPlayer";
import EmotionInfo from "../components/view-session/EmotionInfo";
import EmotionComparativeAnalysis from "../components/view-session/EmotionComparativeAnalysis";
import EmotionTrendChart from "../components/view-session/EmotionTrendChart";
import SkeletonText from "../components/view-session/SkeletonText";

const ViewSessionPage = () => {
    const { id } = useParams();
    const [isEdit, setIsEdit] = useState(false);
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [emotionLoading, setEmotionLoading] = useState(false);
    const [emotionData, setEmotionData] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    // All sessions belonging to the patient for comparative analysis
    const [allSessions, setAllSessions] = useState([]);
    const [isSummarizing, setIsSummarizing] = useState(false);

    const [form, setForm] = useState({
        description: "",
        date: "",
        notes: "",
        video_file_path: null,
    });

    // Handle form input changes
      const [videoPreview, setVideoPreview] = useState(null);
      const handleChange = (e) => {
          const { name, value, type, files } = e.target;
          if (type === 'file') {
              const file = files[0];
              setForm({ ...form, [name]: file });
              if (file) {
                  const url = URL.createObjectURL(file);
                  setVideoPreview(url);
              } else {
                  setVideoPreview(null);
              }
          } else {
              setForm({ ...form, [name]: value });
          }
      };

    // Handle session update
      const handleUpdateSession = async (updatedSession) => {
          const response = await api.put(`/api/sessions/update/${id}/`, updatedSession).then((res) => {
              if (res.status !== 200) {
                  toast.error("Failed to update session: " + res.data.error);
              } else {
                  toast.success("Session updated successfully!");
                  setForm({
                      description: res.data.description,
                      date: res.data.date,
                      notes: res.data.notes,
                      video_file_path: null,
                  });
                  fetchSession(false);
              }
          });
      }

      // Handle Fetching Data
      const fetchSession = async (initialLoad) => {
          if (initialLoad){
            setIsLoading(true);
          }
          const response = await api.get(`/api/sessions/${id}/`).then((res) => {
              if (res.status !== 200) {
                  toast.error("Failed to fetch session data: " + res.data.error);
                  if (initialLoad){
                    setIsLoading(false);
                  }
              } else{
                  setSession(res.data);
                  // console.log("Fetched session data: ", res.data); // Fetched session data
                  setForm({
                      description: res.data.description || "",
                      date: res.data.date || "",
                      notes: res.data.notes || "",
                      video_file_path: null,
                  });
                  // if video file exists, set video preview
                  if (res.data.video && res.data.video.video_file_path) {
                      setVideoPreview(res.data.video.video_file_path);
                  }
                  if (initialLoad){
                    setIsLoading(false);
                  }
              }
          }).catch((error) => {
              toast.error("Error fetching session data: " + error.message);
              if (initialLoad){
                setIsLoading(false);
              }
          });    
      };

      
      // Fetch all Session Data Based on Patient ID for Comparative Analysis
      useEffect(() => {
          const fetchAllSessions = async () => {
              if (session && session.patient) {
                  const response = await api.get(`/api/sessions/patient/${session.patient.id}/`).then((res) => res);
                  if (response.status === 200) {
                      // exclude the current session id
              
                      setAllSessions(response.data);
                  } else {
                      toast.error("Failed to fetch all sessions.");
                  }
              }
          };
          fetchAllSessions();
      }, [session?.patient?.id]);

      // Fetch session data on mount
      useEffect(() => {
          fetchSession(true);
      }, []);

      // Check for emotion processing based on session changes
      useEffect(() => {
          // Check whether emotion has finished processing
          if (session && session.video) {
              setEmotionLoading(true);
              const isProcessing = session.video.status == 1
              // if it's still processing then keep checking
              if (isProcessing) {
                  const intervalId = setInterval(() => {
                      fetchSession(false); // set false to silently refresh
                      setEmotionLoading(true); // create a loading state for emotion processing
                  }, 5000); // refresh every 5 seconds
                  return () => clearInterval(intervalId)
              }
              else{
                setEmotionLoading(false);
                // condition if the video fails
                if (session.video.status == 3) {
                    toast.error("Video processing failed.");
                    if (session?.video?.emotions) { // if there are some emotions data, set it
                      setEmotionData(session.video.emotions)
                    }
                }
                // condition if the video succeeds
                if (session.video.status == 2) {
                    setEmotionData(session.video.emotions)
                }
              }
          }
      }, [session])

      // Handle video summary generation
     useEffect(() => {
        // check if it's no longer summarizing
        if (!isSummarizing) {
          return;
        }
        // check if a summary have been found, then we can stop summarizing
        if (session?.summary){
          setIsSummarizing(false);
          return
        }

        // if we are still summarizing and there's no summary, then we can start polling
        const intervalId = setInterval(() => {
                      fetchSession(false); // set false to silently refresh
                  }, 5000);

        const timeoutId = setTimeout(() => {
          clearInterval(intervalId);
          setIsSummarizing(false);
          toast.error("Summary generation timed out. Please try again later.");
        }, 180000); // 3 minute timeout

        // clear the interval
        return () => {
          clearInterval(intervalId);
          clearTimeout(timeoutId);
        }
      }, [isSummarizing, session?.summary]);

      const generateSummary = async () => {
        console.log("generating summary!");
        setIsSummarizing(true);
        setSession(prevSession => ({
          ...prevSession,
          summary: null
        }));
        try {
          const res = await api.post(`/api/sessions/${id}/summarize/`);
          if (res.status !== 202) {
            toast.error("There was an error generating the summary.");
            setIsSummarizing(false);
          }
        } catch (error) {
          toast.error("There was an error generating the summary.");
          setIsSummarizing(false);
        }
      };



      // Handle seeking of the video
      const playerRef = useRef();
      const seekTo = (seconds) => {
        if (playerRef.current){
          playerRef.current.currentTime = seconds;
        }
      }

  return (
    <div>
      {/* Header and Breadcrumb */}
      <BreadCrumb title="View Session" links={[{ title: "View Session", links: [{title: "All Patients", url: "/patients"}, {title: "View Session", url: "/sessions/" + id}] }]} />

      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <ClipLoader color="#4A90E2" size={50} />
        </div>
      ) : (
        <div className=" dark:bg-gray-900">
          <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-2 xl:gap-4">

            {/* Patient Information */}
            <div className="col-span-1 mb-4">
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold dark:text-white text-black">Patient Information</h3>
                <form action="#">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="col-span-1">
                            <div className="mb-2 block">
                                <Label htmlFor="patient-name" value="Name" >Name</Label>
                            </div>
                            <TextInput id="patient-name" value={session.patient.name} disabled />
                        </div>
                        <div className="col-span-1">
                            <div className="mb-2 block">
                                <Label htmlFor="patient-email" value="Email">Email</Label>
                            </div>
                            <TextInput id="patient-email" value={session.patient.email} disabled />
                        </div>
                        <div className="col-span-1">
                            <div className="mb-2 block">
                                <Label htmlFor="patient-dob" value="Date of Birth" >Date Of Birth</Label>
                            </div>
                            <TextInput id="patient-dob" value={session.patient.date_of_birth} disabled />
                        </div>
                        <div className="col-span-1">
                            <div className="mb-2 block">
                                <Label htmlFor="patient-gender" value="Gender" >Gender</Label>
                            </div>
                            <TextInput id="patient-gender" value={session.patient.gender} disabled />
                        </div>
                    </div>
                  </form>
              </div>

              {/* AI-Powered Summary */}
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold dark:text-white text-black">AI-Powered Summary</h3>
                {isSummarizing ? (
                  // If it's currently summarizing, show the loading skeleton.
                  <SkeletonText />
                ) : session?.summary ? (
                  // If a summary exists, display it with a "Regenerate" button.
                  <>
                    <p className="text-black dark:text-white">{session.summary}</p>
                    <button className="mt-4 tex-sm text-gray-500" onClick={generateSummary}>
                      Regenerate
                    </button>
                  </>
                ) : session?.video && session?.video?.status == 2 ? (
                  // If no summary exists but there is a video, show the "Generate" button.
                  <Button onClick={generateSummary}>
                    Generate Summary
                  </Button>
                ) : (
                  // If none of the above, it means no video is available to generate a summary from.
                  <p className="text-gray-500 dark:text-gray-400">Summary is not available.</p>
                )}
              </div>

              {/* Zoom Links */}
              <div className="col-span-1 mb-4">
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                  <h3 className="mb-4 text-xl font-semibold dark:text-white text-black">Zoom Links</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {session.zoom_link_host || session.zoom_link_participant ? (
                      <>
                        <div className ="col-span-1">
                          <div class="relative">
                              <Label htmlFor="zoom-link-host" value="Host Link" >Host Link</Label>
                              <input type="text" id="zoom-link-host" class="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={session.zoom_link_host.slice(0, 32) + "..." || "No link available"} disabled />
                              <button type="submit" onClick={() => navigator.clipboard.writeText(session.zoom_link_host)} class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Copy</button>
                        </div>
                      </div>
                      <div className ="col-span-1">
                        <div class="relative">
                            <Label htmlFor="zoom-link-participant" value="Participant Link" >Participant Link</Label>
                            <input type="text" id="zoom-link-participant" class="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={session.zoom_link_participant.slice(0, 32) + "..." || "No link available"} disabled />
                            <button type="submit" onClick={() => navigator.clipboard.writeText(session.zoom_link_participant)} class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Copy</button>
                        </div>
                      </div>
                      </>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No Zoom links available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="col-span-1">
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold dark:text-white text-black">Session Details</h3>
                <p className="text-black dark:text-white"><strong>Session ID:</strong> {session.id}</p>
                <div className ="mt-4">
                  <form action="#">
                      <div className="grid grid-cols-6 gap-6">
                          <div className="col-span-6 sm:col-span-3">
                              <div className="mb-2 block">
                                <Label htmlFor="description" value="Description" />
                              </div>
                              <TextInput 
                                id="description"
                                name="description"
                                placeholder={session.description}
                                value={form.description}
                                onChange={handleChange}
                              />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                              <div className="mb-2 block">
                                <Label htmlFor="date" value="Scheduled Date" />
                              </div>
                              <div className="mb-2">
                                  <input type="date" id="date" name="date" value={form.date} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" />
                              </div>
                              
                          </div>
                      </div>
                    </form>
                </div>

                {videoPreview ? (
                  <div>

                    <VideoPlayer url={videoPreview} playerRef = {playerRef} />

                    <div className="mt-2">
                      <button className="text-sm text-red-500" onClick={() =>{
                        setForm({ ...form, video_file_path: "" });
                        setVideoPreview(null);
                      }}>
                        Remove Video
                      </button>
                      
                    </div>
                  </div>

                ) : (
                  <div>
                    <div className="mt-4 text-gray-500">No video available for this session.</div>
                    <FileUpload
                      sessionId={id}
                      onUploadComplete={(downloadURL) => {
                        setForm({ ...form, video_file_path: downloadURL });
                        setVideoPreview(downloadURL);
                      }}
                      onDisable={(isDisabled) => setIsUploading(isDisabled)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>


          {emotionLoading ? (
            <div className="col-span-2 px-4 pt-6">
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                  <div className="flex justify-center items-center mb-4">
                    <Spinner loading={emotionLoading}></Spinner>
                    <p className="ml-2">Analyzing emotions...</p>
                  </div>
                </div>
            </div>
          ) : (
            <div>
              {/* Emotion Analysis */}
              <div className="col-span-2 px-4 pt-6">
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                    <h3 className="mb-4 text-xl font-semibold dark:text-white">Emotion Analysis</h3>
                    <div className="mt-4">
                      {emotionData.length > 0 ? (
                        <EmotionBarChart data={emotionData} />
                      ) : (
                        <div>Emotion Data not Available</div>
                      )}
                    </div>
                </div>
              </div>

              <div className="col-span-2 px-4 pt-6">
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                  <EmotionInfo emotions={emotionData} seekTo={seekTo} />
                </div>
              </div>

            
              {/* Comparative Analysis */}
              <div className="px-4 pt-6">
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                  {/* Side-by-side radar charts components */}
                  {/* Show the differences of emotions between current and previous session */}
                  <EmotionComparativeAnalysis emotions={emotionData} allSessions={allSessions} currentDate={session.date} />
                </div>
              </div>

              {/* Emotional Trends */}
              {/* Displays a multi-line chart showing emotion trends over time */}
              <div className="px-4 pt-6">
                <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                  <h3 className="mb-4 text-xl font-semibold dark:text-white">Emotional Trends</h3>
                  <p>This section will provide insights and analysis of the patient's progress based on the present and past session data overtime.</p>
                  <EmotionTrendChart allSessions={allSessions} />
                </div>
              </div>

            </div>
          )}

           {/* Session Notes */}
          <div className="col-span-2 px-4 pt-6">
            <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2  dark:border-gray-700 sm:p-6 dark:bg-gray-800">
              <h3 className="text-black dark:text-white mb-4 text-xl font-semibold ">Session Notes</h3>
                <SimpleEditor userContent = {session.notes} setForm={setForm} />
            </div>
          </div>



          {/* Save changes */}
          <div className="flex px-4 pb-6">
            <Button onClick={() => {
              // Append form data to FormData object
                const updatedSession = {
                  description: form.description || session.description,
                  date: form.date || session.date,
                  notes: form.notes || session.notes,
                  video_file_path: form.video_file_path, 
                };

                // if the user upload a new video, it doesn't matter what the previous status is, we set it for processing
                if (form.video_file_path !== null) {
                  updatedSession.video_file_path = form.video_file_path;
                
                // if the user doesn't upload a new video we check if there is an existing video and status to see if we need to reprocess
                } else {
                  if (session.video && (session.video.status == 0 || session.video.status == 3)) {
                    updatedSession.video_file_path = session.video.video_file_path;
                  }
                }

                // console.log("Updated Session: ", updatedSession); // Updated Session
                handleUpdateSession(updatedSession);
            }}
            disabled={isUploading || emotionLoading}
            >
              Save Changes
            </Button>
          </div>
        </div>

        
      )}

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      
      </div>
  );
};



export default ViewSessionPage;

