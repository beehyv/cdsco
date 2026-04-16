import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import type { TestByLab } from "../../types/Interfaces";

interface GroupedTests {
  [manualName: string]: TestByLab[];
}

const LabTests = () => {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get lab name from navigation state
  const labName = location.state?.labName || 'Laboratory';
  
  const [tests, setTests] = useState<TestByLab[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedManuals, setExpandedManuals] = useState<Set<string>>(new Set());


  const fetchTests = async () => {
    if (!labId) {
      setError("Lab ID is required");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/labs/${encodeURIComponent(labId)}/tests`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch tests: ${res.status} ${res.statusText}`);
      }
      
      const data: TestByLab[] = await res.json();
      setTests(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tests");
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [labId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Expand all manuals by default when tests are loaded
  useEffect(() => {
    if (tests.length > 0) {
      const allManualNames = new Set(tests.map(test => test.manual_name || 'Other Tests'));
      setExpandedManuals(allManualNames);
    }
  }, [tests]);

  const renderTestCard = (test: TestByLab, index: number) => {
    return (
      <div
        key={`${test.test_method}-${index}`}
        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-4"
      >
        {test.title_method && (
          <h3 className="text-lg font-semibold text-green-900" style={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 3, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden' 
          }}>
            {test.title_method}
          </h3>
        )}
      </div>
    ); 
  };

  // Group tests by manual_name
  const groupTestsByManual = (tests: TestByLab[]): GroupedTests => {
    const grouped: GroupedTests = {};
    
    tests.forEach(test => {
      const manualName = test.manual_name || 'Other Tests';
      if (!grouped[manualName]) {
        grouped[manualName] = [];
      }
      grouped[manualName].push(test);
    });
    
    // Sort tests within each group
    Object.keys(grouped).forEach(manualName => {
      grouped[manualName].sort((a, b) => 
        (a.title_method || "").localeCompare(b.title_method || "")
      );
    });
    
    return grouped;
  };

  // Filter tests
  const filteredTests = tests.filter(test => {
    const matchesSearch = !searchTerm || 
      test.title_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.manual_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const groupedTests = groupTestsByManual(filteredTests);
  const manualNames = Object.keys(groupedTests).sort((a, b) => a.localeCompare(b));
  
  // Calculate total filtered tests count
  const totalFilteredTests = Object.values(groupedTests).reduce((sum, tests) => sum + tests.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Available Tests</h2>
              <p className="text-sm text-gray-600 mt-1">All tests done by {labName}</p>
            </div>
            <div className="flex items-center gap-4">
              {!loading && tests.length > 0 && (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {totalFilteredTests} of {tests.length} test{tests.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-6 pb-24">

      {/* Search Bar */}
      {!loading && !error && tests.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading tests...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-400 mr-3">⚠️</span>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading tests</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchTests}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tests Display */}
      {!loading && !error && tests.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {labName}
          </h2>
          
          <div className="space-y-4">
            {manualNames.map((manualName) => {
              const manualTests = groupedTests[manualName];
              const isExpanded = expandedManuals.has(manualName);
              
              return (
                <div key={manualName} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Manual Header */}
                  <button
                    onClick={() => {
                      setExpandedManuals(prev => {
                        const newSet = new Set(prev);
                        if (isExpanded) {
                          newSet.delete(manualName);
                        } else {
                          newSet.add(manualName);
                        }
                        return newSet;
                      });
                    }}
                    className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 text-left flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-green-900">
                        {manualName}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {manualTests.length} test{manualTests.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Manual Tests Content */}
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {manualTests.map((test, index) => renderTestCard(test, index))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && tests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
          <div className="text-6xl mb-4">🔬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
          <p className="text-gray-600 mb-4">
            This laboratory doesn't have any tests registered in the system.
          </p>
          <button
            onClick={() => navigate('/allLabs')}
            className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to All Labs
          </button>
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && tests.length > 0 && totalFilteredTests === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matching tests</h3>
          <p className="text-gray-600 mb-4">
            No tests match your current search criteria.
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Floating Navigation */}
      {!loading && !error && tests.length > 0 && (
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate('/allLabs')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed shadow-sm"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
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

export default LabTests;
