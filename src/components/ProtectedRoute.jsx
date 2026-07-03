import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
      </div>
    )
  }

  if (!user) {
    // Send them to login, remembering where they were headed.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
