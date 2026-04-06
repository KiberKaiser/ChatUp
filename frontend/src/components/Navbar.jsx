import { useAuthStore } from "../store/useAuthStore"
import LogoChatUp from "../assets/logochatup.png"
import LogoChatUpWhite from "../assets/logochatupwhite.png"
import { Link } from "react-router-dom"
import { LogOut, User, Settings, UserRoundSearch } from "lucide-react"
import { useThemeStore } from "../store/useThemeStore"

const WHITE_LOGO_THEMES = new Set([
    "dark",
    "synthwave",
    "halloween",
    "forest",
    "aqua",
    "black",
    "luxury",
    "dracula",
    "business",
    "night",
    "coffee",
    "dim",
    "sunset",
])


const Navbar = () =>{
    const{logout,authUser} = useAuthStore()
    const { theme } = useThemeStore()

    const logoSrc = WHITE_LOGO_THEMES.has(theme) ? LogoChatUpWhite : LogoChatUp

    return (
        <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40">
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-2.5">
                        <Link to={"/"} className="flex items-center gap-2.5">
                        <img src={logoSrc} alt="ChatUp" className="w-50 h-12" />
                        </Link>
                    </div>
                    
                    {authUser && (
                        <div className="flex items-center gap-2">
                            <Link to={"/settings"} className="btn btn-sm gap-2 transition-colors">
                                <Settings className="w-4 h-4"/> 
                                <span className="hidden sm:inline">Settings</span>
                            </Link>
                            
                            <Link to={"/profile"} className="btn btn-sm gap-2">
                                <User className="w-4 h-4"/>
                                <span className="hidden sm:inline">Profile</span>
                            </Link>

                            <Link to={"/friends"} className="btn btn-sm gap-2">
                                <UserRoundSearch className="w-4 h-4"/>
                                <span className="hidden sm:inline">Friends</span>
                            </Link>
                            
                            <button className="btn btn-sm gap-2" onClick={logout}>
                                <LogOut className="w-4 h-4"/>
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
export default Navbar