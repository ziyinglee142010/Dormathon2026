// import { FileInput, Label } from "flowbite-react";

// export function FileUpload( { name, id, onChange }) {
//   return (
//     <div className="flex w-full items-center justify-center">
//       <Label
//         htmlFor={id}
//         className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
//       >
//         <div className="flex flex-col items-center justify-center pb-6 pt-5">
//           <svg
//             className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
//             aria-hidden="true"
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 20 16"
//           >
//             <path
//               stroke="currentColor"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
//             />
//           </svg>
//           <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
//             <span className="font-semibold">Click to upload</span> or drag and drop
//           </p>
//           <p className="text-xs text-gray-500 dark:text-gray-400">MP4, MKV, AVI</p>
//         </div>
//         <FileInput onChange={onChange} id={id} name={name} className="hidden" />
//       </Label>
//     </div>
//   );
// }

// FileUpload.jsx
import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FileInput, Label } from "flowbite-react";
import { useState } from "react";

export default function FileUpload({ sessionId, onUploadComplete, onDisable }) {
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (event) => {
    onDisable(true);
    const file = event.target.files[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `videos/${sessionId}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(prog);
        },
        (error) => {
          console.error("Upload failed:", error);
          setProgress(0);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at:", downloadURL);
          if (onUploadComplete) {
            onUploadComplete(downloadURL);
            setProgress(0);
            onDisable(false);
          }
        }
      );
    } catch (err) {
      console.error("Error uploading:", err);
      setProgress(0);
      onDisable(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center">
      <Label
        htmlFor="video-upload"
        className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
      >
        <div className="flex flex-col items-center justify-center pb-6 pt-5">
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">MP4, MKV, AVI</p>
          {progress > 0 && <p className="text-xs mt-2">Progress: {Math.round(progress)}%</p>}
        </div>
        <FileInput id="video-upload" onChange={handleFileChange} className="hidden" />
      </Label>
    </div>
  );
}


