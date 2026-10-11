import React from 'react';
import { Select } from 'flowbite-react';

function AddEmotionModal({ isOpen, onClose, onAdd}) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const newEmotion = {
      category: form.category.value ? form.category.value : "neutral",
      source: form.source.value ? form.source.value : "manual",
      start_time: form.start_time.value ? form.start_time.value : "00:00:00",
      end_time: form.end_time.value ? form.end_time.value : "00:00:00",
    };
    onAdd(newEmotion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full h-full max-w-md px-4 md:h-auto flex items-center justify-center">
        {/* Modal content */}
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-800 w-full">
          {/* Modal header */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Add Emotion
                </h3>
                <button type="button" onClick={onClose} className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span className="sr-only">Close modal</span>
                </button>
            </div>
          {/* Modal body */}
          <div className="p-4 md:p-5">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Form fields for adding emotion details

                    Select emotion category
                    Source of emotion is by default "manual"
                    Start time and end time are in HH:MM:SS format
                    Video id is required
                    */}
                    <div>
                        <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Emotion Category</label>
                        <Select id="category" name="category" required>
                            <option value="Happiness">Happy</option>
                            <option value="Sadness">Sad</option>
                            <option value="Anger">Angry</option>
                            <option value="Fear">Fearful</option>
                            <option value="Disgust">Disgusted</option>
                            <option value="Surprise">Surprised</option>
                            <option value="Neutral">Neutral</option>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="source" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Source</label>
                        <Select id="source" name="source" required>
                            <option value="manual">Manual</option>
                            <option value="automatic">Automatic</option>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="start_time" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Start Time (HH:MM:SS)</label>
                        <input type="text" name="start_time" id="start_time" placeholder="00:00:00" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                    </div>
                    <div>
                        <label htmlFor="end_time" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">End Time (HH:MM:SS)</label>
                        <input type="text" name="end_time" id="end_time" placeholder="00:00:10" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                    </div>
                    <div className="flex justify-between items-center">
                        <button type="button" onClick={onClose} className="text-sm text-gray-700 hover:underline dark:text-gray-300">Cancel</button>
                        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add Emotion</button>
                    </div>

                </form>
            </div>

        </div>
      </div>
    </div>
  );
}

export default AddEmotionModal;