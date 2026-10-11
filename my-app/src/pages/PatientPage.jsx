import React from "react";
import { useState, useEffect } from "react";
import PatientModal from "../components/Modals/AddUpdatePatientModal"; // adjust path if needed
import DeleteModal from "../components/Modals/DeleteModal";
import Spinner from "../components/Spinner";
import { ToastContainer, toast } from "react-toastify";
import api from '../api'; // Adjust the import based on your API setup
import BreadCrumb from "../components/BreadCrumb";

const genders = {
    male: "Male",
    female: "Female",
    other: "Other"
};

const PatientsPage = () => {
    
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentPatient, setCurrentPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Handle deletion
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);

    // Handle search
    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddPatient = async (newPatient, photoFile) => {
        console.log("Adding new patient:", newPatient);
        
        try {
            // Create patient first
            const response = await api.post('/api/patients/add/', newPatient);
            
            if (response.status === 201) {
                const createdPatient = response.data;
                
                // Upload photo if provided
                if (photoFile) {
                    await uploadPatientPhoto(createdPatient.id, photoFile);
                }
                
                toast.success("Patient added successfully!");
                fetchPatients();
            } else {
                toast.error("Failed to add patient: " + response.statusText);
            }
        } catch (error) {
                const emailError = error.response?.data?.email[0];
            toast.error("Failed to add patient: " + emailError || error.message);
            console.error("Error adding patient:", error);
        }
        
        setIsModalOpen(false);
        setCurrentPatient(null);
    };

    const handleUpdatePatient = async (updatedPatient, photoFile) => {
        try {
            const response = await api.put(`/api/patients/update/${updatedPatient.id}/`, updatedPatient);
            
            if (response.status === 200) {
                // Upload new photo if provided
                if (photoFile) {
                    await uploadPatientPhoto(updatedPatient.id, photoFile);
                }
                
                toast.success("Patient updated successfully!");
                fetchPatients();
            } else {
                toast.error("Failed to update patient: " + response.statusText);
            }
        } catch (error) {
            toast.error("Failed to update patient: " + error.message);
            console.error("Error updating patient:", error);
        }
    };

    const uploadPatientPhoto = async (patientId, photoFile) => {
        try {
            const formData = new FormData();
            formData.append('photo', photoFile);

            const response = await api.patch(
                `/api/patients/${patientId}/upload-photo/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.status === 200) {
                console.log("✅ Photo uploaded successfully");
            } else {
                toast.warning("Patient saved but photo upload failed");
            }
        } catch (error) {
            console.error("Error uploading photo:", error);
            toast.warning("Patient saved but photo upload failed: " + error.message);
        }
    };

    const handleDeletePatient = async (patient) => {
        try {
            const response = await api.delete(`/api/patients/delete/${patient.id}/`);
            
            if (response.status === 204) {
                toast.success("Patient deleted successfully!");
                fetchPatients();
            } else {
                toast.error("Failed to delete patient: " + response.statusText);
            }
        } catch (error) {
            toast.error("Failed to delete patient: " + error.message);
            console.error("Error deleting patient:", error);
        }
    };

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/patients/');
            
            if (response.status === 200) {
                setPatients(response.data);
                setLoading(false);
            } else {
                toast.error("Failed to fetch patients: " + response.statusText);
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
            toast.error("Failed to fetch patients: " + error.message + ". Please refresh the page.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);
        
    return (
        <div>
            {/* Header and Breadcrumb */}
            <BreadCrumb title="All Patients" links={[{ title: "Patients", url: "/patients" }]}>
                <div className="flex items-center mb-4 sm:mb-0">
                    <form className="sm:pr-3" action="#" method="GET">
                        <label htmlFor="patients-search" className="sr-only">Search</label>
                        <div className="relative w-48 mt-1 sm:w-64 xl:w-96">
                            <input 
                                type="text" 
                                id="patients-search" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                placeholder="Search for patients" 
                            />
                        </div>
                    </form>
                </div>
                <button 
                    className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800" 
                    type="button" 
                    onClick={() => { setIsModalOpen(true); }}
                >
                    Add new patient
                </button>
            </BreadCrumb>

            {loading ? (
                // Spinner or loading state
                <div className="flex items-center justify-center h-screen">
                    <Spinner loading={loading} />  
                </div>
            ) : (
                // Table
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
                                            {/* NEW: Photo column */}
                                            <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Photo</th>
                                            <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Patient Name</th>
                                            <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Date of Birth</th>
                                            <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Gender</th>
                                            <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                        {filteredPatients.map(patient => (
                                            <tr key={patient.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <td className="w-4 p-4">
                                                    <input type="checkbox" className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                                </td>
                                                {/* NEW: Photo display */}
                                                <td className="p-4">
                                                    {patient.photo_url ? (
                                                        <img 
                                                            src={patient.photo_url} 
                                                            alt={patient.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                                    <div className="text-base font-semibold text-gray-900 dark:text-white">{patient.name}</div>
                                                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">{patient.email}</div>
                                                </td>
                                                <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">{patient.date_of_birth}</td>
                                                <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">{genders[patient.gender]}</td>
                                                <td className="p-4 space-x-2 whitespace-nowrap">
                                                    <button 
                                                        onClick={() => { setIsModalOpen(true); setIsEdit(true); setCurrentPatient(patient); }} 
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                                                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path>
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => { setIsDeleteModalOpen(true); setPatientToDelete(patient); }} 
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                                        </svg>
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
            )}

            {/* Pagination */}
            <div className="sticky bottom-0 right-0 items-center w-full p-4 bg-white border-t border-gray-200 sm:flex sm:justify-between dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center mb-4 sm:mb-0">
                    <a href="#" className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                    </a>
                    <a href="#" className="inline-flex justify-center p-1 mr-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                        </svg>
                    </a>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        Showing <span className="font-semibold text-gray-900 dark:text-white">1-20</span> of <span className="font-semibold text-gray-900 dark:text-white">{patients.length}</span>
                    </span>
                </div>
                <div className="flex items-center space-x-3">
                    <a href="#" className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                        <svg className="w-5 h-5 mr-1 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                        Previous
                    </a>
                    <a href="#" className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                        Next
                        <svg className="w-5 h-5 ml-1 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                        </svg>
                    </a>
                </div>
            </div>

            {isModalOpen && (
                <PatientModal
                    onAdd={handleAddPatient}
                    onUpdate={handleUpdatePatient}
                    onClose={() => { setIsModalOpen(false); setIsEdit(false); setCurrentPatient(null); }}
                    patient={currentPatient}
                    isEdit={isEdit}
                />
            )}

            {isDeleteModalOpen && (
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => { setIsDeleteModalOpen(false); }}
                    onDelete={handleDeletePatient}
                    data={patientToDelete}
                />
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
};

export default PatientsPage;