
import { Outlet } from "react-router-dom";

const VideoCallLayout = () => {
    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-800">
        <header className="bg-white dark:bg-gray-900 shadow p-4">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Video Call</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4">
            <Outlet />
        </main>
        </div>
    );
};

export default VideoCallLayout;