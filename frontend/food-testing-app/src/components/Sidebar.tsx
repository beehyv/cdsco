import { Home, TestTube, Settings, HelpCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    
    {
      name: "Find Labs for Tests",
      href: "/",
      icon: Home,
    },
    {
      name: "Find Tests by Lab",
      href: "/allLabs",
      icon: TestTube,
    }
  ];

  const secondaryNavigation = [
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      name: "Help",
      href: "/help",
      icon: HelpCircle,
    },
  ];

  const isActive = (href: string, name?: string) => {
    // Keep "Book Tests" highlighted for the entire booking flow
    if (name === "Find Labs for Tests") {
      return location.pathname === "/" || location.pathname === "/tests" || location.pathname === "/labs";
    } else if (name === "Find Tests by Lab") {
      return location.pathname === "/allLabs" || location.pathname.startsWith("/labs/");
    }
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed top-16 left-0 h-[calc(100vh-4rem)] z-30 shadow-lg">
      {/* Sidebar Header */}
      <div className="px-5 py-4">
        
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 flex flex-col">
        <div className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.name);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  active
                    ? "bg-green-600 text-white"
                    : "teBookxt-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <Icon size={16} className={active ? "text-white" : "text-gray-500"} />
              <span className={active ? "text-white" : undefined}>{item.name}</span>
            </Link>
          );
        })}
        </div>

        {/* Secondary Navigation */}
        <div className="pt-4 mt-auto border-t border-gray-200">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.name);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    active
                      ? "bg-green-600 text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <Icon size={16} className={active ? "text-white" : "text-gray-500"} />
                <span className={active ? "text-white" : undefined}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer (unused) */}
    </div>
  );
};

export default Sidebar;
