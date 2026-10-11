import Sidebar from "../components/SideBar"
import { Outlet } from "react-router-dom"


const MainLayout = () => {
  return (
    <div className = "flex pt-16 overflow-hidden bg-gray-50 dark:bg-gray-800">
        <Sidebar />
        <main className="flex-1 relative h-full overflow-y-auto bg-gray-50 lg:ml-64 dark:bg-gray-800">
            <Outlet />
        </main>
    </div>
  )
}

export default MainLayout
