import { Bell, User } from "lucide-react";

const Topbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 w-full flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm z-40">
      {/* Left: Brand */}
      <div className="text-sm font-medium text-gray-800"><h2 className="text-xl text-gray-500">Food Safe</h2></div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Notifications">
          <Bell className="text-green-600" size={18} />
          <span className="sr-only">Notifications</span>
        </button>

        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <User className="text-green-700" size={16} />
          </div>
          <span className="text-sm font-medium text-gray-700">fssai</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
