import React, { useState, useEffect } from 'react';
import FileUpload from '../FileUpload';
import api from '../../api';


// Add only 
const SessionModal = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({
    date: "",
    therapist: "",
    patient: "",
    clinic: "",
    notes: "",
    description: "",
    video: "", // Firebase download URL goes here
  });

    const [clinics, setClinics] = useState([]);
    const [therapists, setTherapists] = useState([]);
    const [patients, setPatients] = useState([]);

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState(""); // show local preview or Firebase URL
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, t, p] = await Promise.all([
          api.get("/api/clinics/"),
          api.get("/api/therapists/"),
          api.get("/api/patients/"),
        ]);
        setClinics(c.data);
        setTherapists(t.data);
        setPatients(p.data);
      } catch (e) {
        console.error("Failed to fetch dropdowns:", e);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Simple required validation
  const validate = () => {
    const next = {};
    if (!form.date) next.date = "Date is required";
    if (!form.therapist) next.therapist = "Therapist is required";
    if (!form.patient) next.patient = "Patient is required";
    if (!form.clinic) next.clinic = "Clinic is required";
    // Optional: require a video URL
    // if (!form.video) next.video = "Video is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // At this point, form.video should already be a Firebase download URL
    onAdd(form); // parent can POST JSON to your backend
    onClose();
  };

  const clearVideo = () => {
    setForm((f) => ({ ...f, video: "" }));
    setVideoPreview("");
  };

  const isSubmitDisabled =
    isUploading ||
    !form.date ||
    !form.therapist ||
    !form.patient ||
    !form.clinic;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full h-full max-w-2xl px-4 md:h-auto">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex items-start justify-between p-5 border-b rounded-t dark:border-gray-700 border-gray-200">
            <h3 className="text-xl font-semibold dark:text-white">Add Session</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-700 dark:hover:text-white"
            >
              ✖
            </button>
          </div>

          <div className="p-6 space-y-6">
            <form onSubmit={submitForm}>
              <div className="grid grid-cols-6 gap-6">
                {/* Date */}
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    required
                    value={form.date}
                    onChange={handleChange}
                  />
                  {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date}</p>}
                </div>

                {/* Therapist */}
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="therapist" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Therapist
                  </label>
                  <select
                    name="therapist"
                    id="therapist"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                    value={form.therapist}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Select therapist</option>
                    {therapists.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.username || t.name || t.email}
                      </option>
                    ))}
                  </select>
                  {errors.therapist && <p className="text-sm text-red-600 mt-1">{errors.therapist}</p>}
                </div>

                {/* Patient */}
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="patient" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Patient
                  </label>
                  <select
                    name="patient"
                    id="patient"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                    value={form.patient}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Select patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.email})
                      </option>
                    ))}
                  </select>
                  {errors.patient && <p className="text-sm text-red-600 mt-1">{errors.patient}</p>}
                </div>

                {/* Clinic */}
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="clinic" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Clinic
                  </label>
                  <select
                    name="clinic"
                    id="clinic"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                    value={form.clinic}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Select clinic</option>
                    {clinics.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.clinic && <p className="text-sm text-red-600 mt-1">{errors.clinic}</p>}
                </div>

                {/* Description */}
                <div className="col-span-6">
                  <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>

                {/* Notes */}
                <div className="col-span-6">
                  <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    id="notes"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={form.notes}
                    onChange={handleChange}
                  />
                </div>

                {/* Upload Video via Firebase */}
                {/* <div className="col-span-6">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Upload Video
                  </label>

                  <FileUpload
                    // Use something stable to name the folder/path; patient ID is okay
                    sessionId={form.patient || "temp"}
                    onDisable={(disabled) => setIsUploading(disabled)}
                    onLocalPreview={(blobUrl) => setVideoPreview(blobUrl)} // OPTIONAL: if your FileUpload exposes this
                    onUploadComplete={(downloadURL) => {
                      setForm((f) => ({ ...f, video: downloadURL }));
                      setVideoPreview(downloadURL); // fallback preview
                    }}
                    onError={(msg) => {
                      console.error("Upload error:", msg);
                    }}
                  />

                  {(videoPreview || form.video) && (
                    <div className="mt-4">
                      <video
                        src={videoPreview || form.video}
                        controls
                        className="w-full max-h-64 rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={clearVideo}
                        className="mt-2 text-red-600 hover:text-red-800"
                      >
                        Remove Video
                      </button>
                    </div>
                  )}
                  {errors.video && <p className="text-sm text-red-600 mt-1">{errors.video}</p>}
                  {isUploading && (
                    <p className="text-sm text-gray-500 mt-2">Uploading… please wait</p>
                  )}
                </div> */}
              </div>

              <div className="justify-start pt-12 pb-2">
                <button
                  className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                    isSubmitDisabled
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700"
                  }`}
                  type="submit"
                  disabled={isSubmitDisabled}
                >
                  Add Session
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-2 text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionModal;

// import React, { useState, useEffect } from "react";
// import FileUpload from "../FileUpload"; // make sure FileUpload has default export
// import api from "../../api";

// const SessionModal = ({ onAdd, onClose }) => {
//   const [form, setForm] = useState({
//     date: "",
//     therapist: "",
//     patient: "",
//     clinic: "",
//     notes: "",
//     description: "",
//     video: "", // will hold Firebase downloadURL instead of file
//   });

//   const [clinics, setClinics] = useState([]);
//   const [therapists, setTherapists] = useState([]);
//   const [patients, setPatients] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       api.get("/api/clinics/").then((res) => setClinics(res.data));
//       api.get("/api/therapists/").then((res) => setTherapists(res.data));
//       api.get("/api/patients/").then((res) => setPatients(res.data));
//     };
//     fetchData();
//   }, []);

//   // handle form fields except video
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: value });
//   };

//   // handle form submit
//   const submitForm = (e) => {
//     e.preventDefault();
//     // now form.video already contains Firebase download URL
//     onAdd(form); // send as JSON
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//       <div className="relative w-full h-full max-w-2xl px-4 md:h-auto">
//         <div className="relative bg-white rounded-lg shadow dark:bg-gray-800">
//           <div className="flex items-start justify-between p-5 border-b rounded-t dark:border-gray-700 border-gray-200">
//             <h3 className="text-xl font-semibold dark:text-white">Add Session</h3>
//             <button
//               type="button"
//               onClick={onClose}
//               className="text-gray-400 hover:bg-gray-200 rounded-lg p-1.5"
//             >
//               ✖
//             </button>
//           </div>

//           <div className="p-6 space-y-6">
//             <form onSubmit={submitForm}>
//               {/* form fields ... */}

//               <div className="col-span-6">
//                 <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
//                   Upload Video
//                 </label>

//                 <FileUpload
//                   sessionId={form.patient || "temp"} // you can use patient id/session id
//                   onUploadComplete={(downloadURL) =>
//                     setForm({ ...form, video: downloadURL })
//                   }
//                   onDisable={(isDisabled) => {
//                     // Optionally handle disabling form elements during upload
//                     console.log("Upload in progress:", isDisabled);
//                   }}
//                 />

//                 {form.video && (
//                   <video
//                     src={form.video}
//                     controls
//                     className="w-full max-h-64 rounded border mt-4"
//                   />
//                 )}
//               </div>

//               <div className="pt-12">
//                 <button
//                   className="text-white bg-primary-700 hover:bg-primary-800 px-5 py-2.5 rounded-lg"
//                   type="submit"
//                 >
//                   Add Session
//                 </button>
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   className="ml-2 text-gray-700 bg-gray-200 hover:bg-gray-300 px-5 py-2.5 rounded-lg"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SessionModal;
