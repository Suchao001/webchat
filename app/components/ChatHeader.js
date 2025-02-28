import { Button } from "@/components/ui/button";
import { User, LogOut, Trash2 } from "lucide-react";
import { useState, useRef } from "react";

export default function ChatHeader({ username, logout, DeleteHistory }) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const handleDeleteHistory = () => {
    if (window.confirm("Are you sure you want to delete the chat history?")) {
      DeleteHistory();
    }
  };

  return (
    <div className="p-4 flex justify-between items-center">
      <div className="flex items-center">
        <User className="w-5 h-5 mr-2" />
        <span className="font-medium">{username}</span>
      </div>
      <div className="relative" ref={profileDropdownRef}>
        <Button
          onClick={handleDeleteHistory}
          variant="ghost"
          className="p-2 rounded-full hover:bg-gray-700"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          variant="ghost"
          className="p-2 rounded-full hover:bg-gray-700"
        >
          <LogOut className="w-5 h-5" />
        </Button>
        {profileDropdownOpen && (
          <div className="absolute right-0 z-10 mt-1 w-40 bg-white border rounded-md shadow-lg">
            <div
              className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 text-black flex items-center"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
