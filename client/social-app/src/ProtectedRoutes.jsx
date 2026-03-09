import { useContext } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { UserContext } from "./context/Context.jsx"


const ProtectedRoutes = () => {

    const { isAuthenticated, loading } = useContext(UserContext)

    if (loading) return <div>Loading...</div>
    if (!isAuthenticated && !loading) return <Navigate to='/login' replace />

    return (
        <Outlet />
    ) 
}

export default ProtectedRoutes
