
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../components/Modals/DeleteModal";
import SessionModal from "../components/Modals/AddSessionModal";
import ClipLoader from "react-spinners/ClipLoader";
import Spinner from "../components/Spinner";
import api from "../api";
import BreadCrumb from "../components/BreadCrumb";


const SessionPage = () => {
    const navigate = useNavigate();

    // Session Page 
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    // for Start-Session modal
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");

    //handle deletion
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState(null);

    // handle date filters
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // handle search
    const [searchTerm, setSearchTerm] = useState("");
    const filteredSessions = sessions.filter(session => {
        const matchesSearch = session.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                session.clinic.name.toLowerCase().includes(searchTerm.toLowerCase());
                                
        const matchesStartDate = startDate ? new Date(session.date) >= new Date(startDate) : true;
        const matchesEndDate = endDate ? new Date(session.date) <= new Date(endDate) : true;

        return matchesSearch && matchesStartDate && matchesEndDate;
    });

    const handleAddSession = async (newSession) => {
        setIsUploading(true);
        api.post("/api/sessions/add/", newSession)
            .then((response) => {
                if (response.status !== 201) {
                    toast.error("Failed to add session: " + response.data.error);
                } else {
                    toast.success("Session added successfully!");
                    fetchSessions();
                    setIsModalOpen(false);
                }
            })
            .catch((error) => {
                console.error("Error adding session:", error);
                toast.error("Failed to add session: " + error.message);
            })
            .finally(() => {
                setIsUploading(false);
            });

    }


    const handleDeleteSession = async (session) => {
        const res = await api.delete(`/api/sessions/delete/${session.id}/`).then((response) => {
            if (response.status !== 204) { // error handling for the incorect response status
                toast.error("Failed to delete session: " + response.data.error);
            } else{
                toast.success("Session deleted successfully!");
                fetchSessions();
                setIsDeleteModalOpen(false);
            }
        }).catch((error) => { 
            // error handling for within the delete request
            console.error("Error deleting session:", error)
            toast.error("Failed to delete session: " + error.message)
        });
    }

    const handleStartSession = async () => {
      if (!selectedPatient) {
        toast.error("Please select a patient first.");
        return;
      }
      try {
        // call your backend endpoint to create session + zoom link
        const res = await api.post("/api/sessions/start/", {
          patient: selectedPatient,
        });

        const zoomLink = res.data.zoom_link;
        if (zoomLink) {
          window.open(zoomLink, "_blank", "noopener,noreferrer");
          toast.success("Session started!");
          setIsStartModalOpen(false);
          fetchSessions(); // refresh list
        } else {
          toast.error("No Zoom link returned.");
        }
      } catch (err) {
        console.error("Error starting session:", err);
        toast.error("Failed to start session: " + err.message);
      }
    };


    const fetchSessions = async () => {
        setLoading(true);
        const response = await api.get("/api/sessions/").then((response) => {
            if (response.status !== 200) {
                toast.error("Failed to fetch sessions: " + response.data.error);
                throw new Error("Failed to fetch sessions");
            } else {
                setSessions(response.data);
                setLoading(false);
            }

        }).catch((error) => {
            console.error("Error fetching sessions:", error);
            toast.error("Failed to fetch sessions: " + error.message + ". Please refresh the page.");
            setLoading(false);
        });
    }

    // For Start-Session modal
    const fetchPatients = async () => {
      try {
        const res = await api.get("/api/patients/");  // backend must expose patients endpoint
        setPatients(res.data);
      } catch (err) {
        console.error("Error fetching patients:", err);
        toast.error("Failed to fetch patients: " + err.message);
      }
    };

    useEffect(() => {
        fetchSessions();
    }, []);
        
    // fetch patients when Start-Session modal opens
    useEffect(() => {
      if (isStartModalOpen) {
        fetchPatients();
      }
    }, [isStartModalOpen]);

    return (
        <div>
            {/* Header and Breadcrumb */}
            <BreadCrumb title="All Sessions" links={[{ title: "Sessions", url: "/sessions" }]}>
                <div className="flex flex-col md:flex-row mb-4 sm:mb-0">
                    <div className="sm:pr-3 relative w-48 mt-1 sm:w-64 xl:w-96">
                        <input type="text" id="sessions-search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search for sessions" />
                    </div>
                    { /* Add a start date and end date filter */}
                    <div className="sm:pr-3 relative w-48 mt-1 sm:w-64 xl:w-96">
                        <input type="date" id="sessions-start-date" value={startDate} onChange={(e) => {
                            setStartDate(e.target.value);
                        }} className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" />
                    </div>
                    <div className="relative w-48 mt-1 sm:w-64 xl:w-96">
                        <input type="date" id="sessions-end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" />
                    </div>
                </div>
                <button className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800" type="button"  onClick={() => { setIsModalOpen(true);}}  >
                    Add new session
                </button>
            </BreadCrumb>

            { loading ? (
                <div className="flex items-center justify-center h-64">
                    <ClipLoader color="#4F46E5" size={50} />
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="flex flex-col">
                        <div className="overflow-x-auto">
                            <div className="inline-block min-w-full align-middle">
                                <div className="overflow-hidden shadow">
                                    <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                        <thead className="bg-gray-100 dark:bg-gray-700">
                                            <tr>
                                                <th className="p-4">
                                                    <input type="checkbox" className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                                </th>
                                                <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Patient Name</th>
                                                <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Session Date</th>
                                                <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Description</th>
                                                <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Clinic</th>
                                                <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                            {filteredSessions.map(session => (
                                                <tr key={session.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    <td className="w-4 p-4">
                                                        <input type="checkbox" className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                                    </td>
                                                    <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">{session.patient.name}</td>
                                                    <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">{session.date}</td>
                                                    <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">{session.description}</td>
                                                    <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">{session.clinic.name}</td>
                                                    <td className="p-4 space-x-2 whitespace-nowrap">
                                                        <button onClick={() => { 
                                                            navigate(`/sessions/${session.id}`);
                                                        }} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                                            {/* View Icon */}
                                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
                                                            View
                                                        </button>
                                                        <button onClick={() => { setIsDeleteModalOpen(true); setSessionToDelete(session); }} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900">
                                                            {/* Delete Icon */}
                                                            <svg  className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}



        
        {/* Pagination and other controls can go here */}
        <div className="sticky bottom-0 right-0 items-center w-full p-4 bg-white border-t border-gray-200 sm:flex sm:justify-between dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-4 sm:mb-0">
                <a href="#" className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
                </a>
                <a href="#" className="inline-flex justify-center p-1 mr-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                </a>
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-white">1-20</span> of <span className="font-semibold text-gray-900 dark:text-white">2290</span>
                </span>
            </div>
            <div className="flex items-center space-x-3">
                <a href="#" className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                <svg className="w-5 h-5 mr-1 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
                Previous
                </a>
                <a href="#" className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                Next
                <svg className="w-5 h-5 ml-1 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                </a>
            </div>
        </div>


            {
                isModalOpen && (
                    <SessionModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                        }}
                        onAdd={handleAddSession}
                        />
                    
                )
            }
            
            
            {
                isDeleteModalOpen && (
                    <DeleteModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => { 
                            setIsDeleteModalOpen(false);
                         }}
                        onDelete={handleDeleteSession}
                        data={sessionToDelete}
                    />
                )
            }

            {isStartModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                  <h2 className="text-lg font-semibold mb-4">Start Session</h2>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Select Patient
                  </label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                  >
                    <option value="">-- Choose patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsStartModalOpen(false)}
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStartSession}
                      className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
                    >
                      Start!
                    </button>
                  </div>
                </div>
              </div>
            )}



            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            /> 

           

        </div>

        
    );


}

export default SessionPage;