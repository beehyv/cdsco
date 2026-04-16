import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Stepper from "../../components/Stepper";
import Button from "../../components/Button";
import { ArrowLeft, Mail, Phone, AlertTriangle } from "lucide-react";
import type { BookingState, Lab, Test } from "../../types/Interfaces";


interface LabsByTest {
  [testName: string]: Lab[];
}

interface LabWithTests {
  lab: Lab;
  tests: Test[];
}

const ViewLabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingState = location.state as BookingState;

  const [labsWithTests, setLabsWithTests] = useState<LabWithTests[]>([]);
  const [testsWithoutLabs, setTestsWithoutLabs] = useState<Test[]>([]);
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(new Set());
  const [noLabsAccordionExpanded, setNoLabsAccordionExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const selectedTests: Test[] = bookingState?.selectedTests || [];
    
    if (!selectedTests || selectedTests.length === 0) {
      console.warn("No test selected");
      return;
    }

    const fetchLabsForTests = async () => {
      setLoading(true);
      try {
        const titles = Array.from(
          new Set(
            selectedTests
              .map((t) => t.title_method)
              .filter((t): t is string => Boolean(t))
          )
        );

        const results: LabsByTest = {};

        await Promise.all(
          titles.map(async (title) => {
            try {
              const res = await fetch(`/api/tests/${encodeURIComponent(title)}/labs`);
              if (!res.ok) throw new Error(`Failed to fetch labs for ${title}`);
              const data: Lab[] = await res.json();
              results[title] = Array.isArray(data) ? data : [];
            } catch (err) {
              console.error(`Error fetching labs for ${title}:`, err);
              results[title] = [];
            }
          })
        );

        // Process the results (setLabsByTest removed as it's unused)
        
        // Restructure data to group tests by lab
        const labMap = new Map<string, LabWithTests>();
        
        selectedTests.forEach((test) => {
          if (!test.title_method) return;
          
          const labs = results[test.title_method] || [];
          // Only process valid labs (not null and with valid laboratory_name)
          const validLabs = labs.filter(lab => lab?.laboratory_name?.trim());
          
          validLabs.forEach((lab) => {
            const labKey = lab.lab_id;
            if (labMap.has(labKey)) {
              labMap.get(labKey)!.tests.push(test);
            } else {
              labMap.set(labKey, { lab, tests: [test] });
            }
          });
        });
        
        // Convert to array and sort by test count (descending)
        const labsWithTestsArray = Array.from(labMap.values())
          .sort((a, b) => b.tests.length - a.tests.length);
        
        setLabsWithTests(labsWithTestsArray);
        
        // Find tests that have no labs available
        // Create a set of all test titles that have labs
        const testsWithLabs = new Set<string>();
        
        // Go through each test title and check if it has any valid labs in results
        titles.forEach(title => {
          const labs = results[title] || [];
          // Check if there are labs AND they have valid data (not null)
          const validLabs = labs.filter(lab => lab?.laboratory_name?.trim());
          if (validLabs.length > 0) {
            testsWithLabs.add(title);
          }
        });
        
        // Find tests that don't have any labs
        const testsWithoutLabsArray = selectedTests.filter(test => 
          test.title_method && !testsWithLabs.has(test.title_method)
        );
        
        setTestsWithoutLabs(testsWithoutLabsArray);
        
        
        // Set all accordions as expanded by default
        if (labsWithTestsArray.length > 0) {
          const allLabIds = labsWithTestsArray.map(item => item.lab.lab_id);
          setExpandedAccordions(new Set(allLabIds));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLabsForTests();
  }, [bookingState]);

  // Scroll to top when component mounts or when labs data is loaded
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loading && labsWithTests.length > 0) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  }, [loading, labsWithTests]);

  return (
    <div className="max-w-6xl mx-auto min-h-screen flex flex-col bg-gray-50">
      {/* Header Section */}
      <div className="mb-3">
        <h2 className="text-xl font-semibold text-gray-900">Available Labs</h2>
      </div>

      {/* Stepper */}
      <div className="mb-3">
        <div className="max-w-none">
          <Stepper />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow flex-1 flex flex-col">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto pr-2 min-h-0 space-y-6">
        {loading && <p>Loading...</p>}

        {!loading && labsWithTests.length === 0 && (
          <p className="text-gray-500 italic">No labs found for the selected tests</p>
        )}

        {!loading && labsWithTests.length > 0 && (
          <div className="space-y-4">
            {labsWithTests.map((labWithTests) => {
              const { lab, tests } = labWithTests;
              const isExpanded = expandedAccordions.has(lab.lab_id);
              
              return (
                <div key={lab.lab_id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Accordion Header */}
                  <button
                    onClick={() => {
                      setExpandedAccordions(prev => {
                        const newSet = new Set(prev);
                        if (isExpanded) {
                          newSet.delete(lab.lab_id);
                        } else {
                          newSet.add(lab.lab_id);
                        }
                        return newSet;
                      });
                    }}
                    className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 text-left flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-green-900">
                          {lab.laboratory_name}
                        </h3>
                        <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          {tests.length} test{tests.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {lab.prime_address && (
                          <p>{lab.prime_address}</p>
                        )}
                        {(lab.city || lab.state) && (
                          <p>
                            {lab.city}
                            {lab.city && lab.state ? `, ${lab.state}` : lab.state || ""}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Right-aligned Contact Details Section */}
                    <div className="flex flex-col items-end ml-6 gap-2">
                      {(lab.contact_email || lab.contact_mobile) && (
                        <div className="text-right">
                          <h4 className="text-sm font-semibold text-green-700 mb-2">Contact Details</h4>
                          <div className="text-xs text-gray-600 space-y-1">
                            {lab.contact_email && (
                              <div className="flex items-center gap-2 justify-end">
                                <Mail size={14} className="text-blue-600" />
                                <span>{lab.contact_email}</span>
                              </div>
                            )}
                            {lab.contact_mobile && (
                              <div className="flex items-center gap-2 justify-end">
                                <Phone size={14} className="text-green-600" />
                                <span>{lab.contact_mobile}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Expand/Collapse Icon */}
                      <div className="mt-2">
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Available Tests:</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {tests.map((test, testIndex) => (
                          <div
                            key={`${test.title_method}-${testIndex}`}
                            className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-150"
                          >
                            <h5 className="font-medium text-green-900 text-sm mb-2">
                              {test.title_method || "Unnamed Test"}
                            </h5>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}


        {/* Separate accordion for tests with no labs - always at the bottom */}
        {!loading && testsWithoutLabs.length > 0 && (
          <div className="mt-6 border border-red-200 rounded-xl overflow-hidden">
            {/* No Labs Accordion Header */}
            <button
              onClick={() => setNoLabsAccordionExpanded(!noLabsAccordionExpanded)}
              className="w-full p-4 bg-red-50 hover:bg-red-100 transition-colors duration-200 text-left flex justify-between items-start"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle size={20} className="text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">
                    Tests Without Available Labs
                  </h3>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {testsWithoutLabs.length} test{testsWithoutLabs.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-sm text-red-700">
                  These tests do not have any labs available in our network
                </p>
              </div>
              
              {/* Expand/Collapse Icon */}
              <div className="ml-6">
                <svg
                  className={`w-5 h-5 text-red-500 transition-transform duration-200 ${
                    noLabsAccordionExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            {/* No Labs Accordion Content */}
            {noLabsAccordionExpanded && (
              <div className="p-4 bg-white border-t border-red-200">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Tests Without Labs:</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {testsWithoutLabs.map((test, testIndex) => (
                    <div
                      key={`no-lab-${test.title_method}-${testIndex}`}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <h5 className="font-medium text-red-900 text-sm mb-2">
                        {test.title_method || "Unnamed Test"}
                      </h5>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Floating Back Button */}
        <div className="sticky bottom-0 flex items-center justify-start mt-6 pt-5 border-t border-gray-200 bg-white shadow-lg z-20">
          <Button
            variant="outline"
            onClick={() => {
              const updatedBookingState = { ...bookingState, selectedTests: [] };
              navigate("/tests", { state: updatedBookingState });
            }}
            leftIcon={<ArrowLeft size={18} />}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewLabs;
