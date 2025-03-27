
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-brand-800">
            FinalRound
          </Link>
          <div className="hidden md:flex ml-10 space-x-6">
            <Link to="/jobs" className="text-gray-600 hover:text-brand-700">
              Jobs
            </Link>
            <Link to="/ai-interview" className="text-gray-600 hover:text-brand-700">
              AI Interview
            </Link>
            <Link to="/questionnaires" className="text-gray-600 hover:text-brand-700">
              Assessments
            </Link>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-brand-700">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-brand-100 text-brand-800">
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span>Profile</span>
              </Link>
              <Button variant="outline" onClick={signOut} className="text-brand-700 border-brand-200 hover:bg-brand-50">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="text-brand-700 border-brand-200 hover:bg-brand-50">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-brand-700 hover:bg-brand-800 text-white">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
        
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden pt-4 pb-3 border-t border-gray-200 animate-fadeIn">
          <div className="space-y-1 px-2">
            <Link 
              to="/jobs" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-700 hover:bg-brand-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Jobs
            </Link>
            <Link 
              to="/ai-interview" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-700 hover:bg-brand-50"
              onClick={() => setIsMenuOpen(false)}
            >
              AI Interview
            </Link>
            <Link 
              to="/questionnaires" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-700 hover:bg-brand-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Assessments
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-700 hover:bg-brand-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <div className="pt-4 flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }} 
                    className="w-full text-brand-700 border-brand-200"
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="pt-4 flex flex-col space-y-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-brand-700 border-brand-200">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-brand-700 hover:bg-brand-800 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
