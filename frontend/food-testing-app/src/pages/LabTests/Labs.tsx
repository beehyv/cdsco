import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Labs, PaginatedResponse, PaginationInfo } from "../../types/Interfaces";

const LABS_PER_PAGE = 15;

const AllLabsPage = () => {
  const navigate = useNavigate();
  const [labs, setLabs] = useState<Labs[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate pagination values
  const totalPages = paginationInfo?.totalPages || 1;
  const totalLabs = paginationInfo?.total || 0;
  const currentSkip = (currentPage - 1) * LABS_PER_PAGE;

  const fetchLabs = async (page: number = 1, search: string = "") => {
    setLoading(true);
    setError(null);
    
    try {
      const skip = (page - 1) * LABS_PER_PAGE;
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/allLabs?skip=${skip}&limit=${LABS_PER_PAGE}${searchParam}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch labs: ${res.status} ${res.statusText}`);
      }
      
      const response: PaginatedResponse<Labs> = await res.json();
      setLabs(response.data);
      setPaginationInfo(response.pagination);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch labs");
      setLabs([]);
      setPaginationInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  // Handle search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };


  const handleLabClick = (lab: Labs) => {
    if (lab.LabId) {
      navigate(`/labs/${lab.LabId}/tests`, {
        state: { 
          labName: lab.LaboratoryName || 'Laboratory',
          labId: lab.LabId 
        }
      });
    }
  };

  const renderLabCard = (lab: Labs) => {
    return (
      <button
        key={lab.index || lab.LabId}
        onClick={() => handleLabClick(lab)}
        aria-label={`View tests for ${lab.LaboratoryName }`}
        className="w-full text-left bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {/* Header with status */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-green-900 flex-1 pr-2" style={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden' 
          }}>
            {lab.LaboratoryName}
          </h3>
          <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0 mt-1"></div>
        </div>
        
        {/* Content */}
        <div className="space-y-3 text-sm text-gray-600 mb-4">
          {lab.PrimeAddress && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span>{lab.PrimeAddress}</span>
            </div>
          )}
          {lab.ContactPerson && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span>{lab.ContactPerson}</span>
            </div>
          )}
          {lab.ContactMobile && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span>{lab.ContactMobile}</span>
            </div>
          )}
          {lab.ContactEmail && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span>{lab.ContactEmail}</span>
            </div>
          )}
          {lab.LandLine && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span>{lab.LandLine}</span>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {lab.LabId && (
          <div className="text-sm text-gray-500">
            Lab ID: {lab.LabId}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Find Tests by Lab</h2>
              <p className="text-sm text-gray-600 mt-1">
                Select a lab to find all tests done by them
                {totalLabs > 0 && (
                  <span className="ml-2 font-medium text-blue-600">
                    ({totalLabs.toLocaleString()} laboratories available)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {!loading && labs.length > 0 && (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {currentSkip + 1}-{Math.min(currentSkip + labs.length, totalLabs)} of {totalLabs}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-6 pb-24">

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading laboratories...</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>
        
        {searchQuery && (
          <div className="mt-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Searching: "{searchQuery}"
              <button
                onClick={handleClearSearch}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-400 mr-3">⚠️</span>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading laboratories</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={() => fetchLabs(currentPage, searchQuery)}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Labs Grid */}
      {!loading && !error && labs.length > 0 && (
        <div className="space-y-4">
          {/* Results summary */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Testing Laboratories</h2>
              {paginationInfo && (
                <p className="text-sm text-gray-600 mt-1">
                  Showing {((paginationInfo.page - 1) * paginationInfo.limit) + 1}-{Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.total)} of {paginationInfo.total.toLocaleString()} laboratories
                  {searchQuery && (
                    <span className="ml-1">matching "{searchQuery}"</span>
                  )}
                </p>
              )}
            </div>
          </div>
          
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {labs.map((lab) => renderLabCard(lab))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && labs.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="text-6xl mb-4">🔬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? "No laboratories match your search" : "No laboratories found"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? `No laboratories found matching "${searchQuery}". Try a different search term.`
              : "There are currently no laboratories in the database."
            }
          </p>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Sticky Pagination */}
      {!loading && !error && labs.length > 0 && (
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AllLabsPage;
