// import './App.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import ProductDetails from "./pages/LabsFinder/ProductDetails";
import ViewTests from "./pages/LabsFinder/ViewTests";
import ViewLabs from "./pages/LabsFinder/ViewLabs";
import Labs from "./pages/LabTests/Labs";
import LabTests from "./pages/LabTests/LabTests";
// import Breadcrumbs from "./components/Breadcrumbs"

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Topbar - Full width, positioned above everything */}
        <Topbar />
        
        {/* Fixed Sidebar - positioned below topbar */}
        <Sidebar />
        
        {/* Main Content with left margin for sidebar and top margin for topbar */}
        <div className="ml-64 mt-16 min-h-screen">
          {/* Page Content */}
          <main className="flex-1 p-6 lg:p-8 overflow-visible">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<ProductDetails />} />
                <Route path="/tests" element={<ViewTests />} />
                <Route path="/labs" element={<ViewLabs />} />
                <Route path="/allLabs" element={<Labs />} />
                <Route path="/labs/:labId/tests" element={<LabTests />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}