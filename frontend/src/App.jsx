import Navbar from "./components/Navbar"
import {Routes, Route, Navigate} from "react-router-dom"

import HomePage from "./pages/HomePage"
import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"
import SettingsPage from "./pages/SettingsPage"
import ProfilePage from "./pages/ProfilePage"
import SearchFriendsPage from "./pages/SearchFriendsPage"

import { useAuthStore } from "./store/useAuthStore"
import { useThemeStore } from "./store/useThemeStore"
import { useEffect } from "react"

import { Loader } from "lucide-react"
import { Toaster } from "react-hot-toast"

const App = () => {
  const {authUser, checkAuth, isCheckingAuth} = useAuthStore()
   const { theme } = useThemeStore()

   useEffect(() => {
    checkAuth()
   }, [checkAuth]);

  useEffect(() => {
   document.documentElement.setAttribute("data-theme", theme)
  }, [theme]);

   if(isCheckingAuth && !authUser) return (
     <div className="flex items-center justify-center h-screen">
       <Loader className="w-10 h-10 animate-spin"/>
       
     </div>
   )
   return (
   <div>
      <Navbar/>
      <Routes>
        <Route path="/" element={authUser ? <HomePage/> : <Navigate to="/login"/>}/>
        <Route path="/signup" element={!authUser ? <SignUpPage/> : <Navigate to="/"/>}/>
        <Route path="/login" element={!authUser ? <LoginPage/> : <Navigate to="/"/>}/>
        <Route path="/settings" element={<SettingsPage/>}/>
        <Route path="/friends" element={authUser ? <SearchFriendsPage/> : <Navigate to="/login"/>}/>
        <Route path="/profile" element={authUser ? <ProfilePage/> : <Navigate to="/login"/>}/>
      </Routes>

      <Toaster/>
   </div>
   )
}
export default App;