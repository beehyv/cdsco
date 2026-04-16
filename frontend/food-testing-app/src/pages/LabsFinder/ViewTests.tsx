import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Stepper from "../../components/Stepper";
import Button from "../../components/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type {Test, Category, BookingState} from "../../types/Interfaces"

const ViewTests = () => {
  const navigate = useNavigate();
  const location = useLocation();


  const [tests, setTests] = useState<Test[]>([]);

  const [loading, setLoading] = useState(false);

  const bookingState = location.state as BookingState;
  
  const selectedCategory: Category | undefined= bookingState?.selectedCategory || undefined;
  const [selectedTests, setSelectedTests] = useState<Test[]>(
    bookingState?.selectedTests || []
  );
  
  

  useEffect(() => {
    if (!selectedCategory?.product_key) {
      console.warn("No productName received in ViewTests");
      return;
    }

    const fetchTests = async () => {
      try {
        setLoading(true);
        console.log("Fetching tests for:", selectedCategory?.product_category);

        const res = await fetch(
          `/api/products/${encodeURIComponent(selectedCategory?.product_key)}/tests`
        );

        if (!res.ok) throw new Error("Failed to fetch tests");
        const data: Test[] = await res.json();
        setTests(data);
      } catch (err) {
        console.error("Error fetching tests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [selectedCategory?.product_key, selectedCategory?.product_category]);

  const toggleTest = (test: Test) => {
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };


    const handleViewLabs = () => {
        if (selectedTests.length === 0) return;
        navigate("/labs", {
        state: { ...bookingState, selectedTests, titleMethod: selectedTests[0].title_method },
        });
    };

  return (
    <div className="max-w-5xl mx-auto min-h-screen flex flex-col bg-gray-50">
      {/* Header Section */}
      <div className="mb-3">
        <h2 className="text-xl font-semibold text-gray-900">Find Labs for Tests</h2>
      </div>

      {/* Stepper */}
      <div className="mb-3">
        <div className="max-w-none">
          <Stepper />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-gray-50 border border-gray-200 p-5 flex-1 flex flex-col">
        {/* Form Header */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Select Tests</h2>
        </div>

        {/* Tests Grid - Scrollable Area */}
        <div className="flex-1 overflow-auto pr-2 min-h-0">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">Loading tests...</p>
            </div>
          )}

          {!loading && tests.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">No tests available for this product.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
            {tests.map((test) => (
              <div
                key={`${test.title_method}-${test.test_method}`}
                className={`border rounded-lg p-4 space-y-3 transition-colors ${
                  selectedTests.includes(test) 
                    ? "bg-green-50 border-green-200" 
                    : "bg-white border-gray-200"
                }`}
              >
                <h4 className="text-base font-semibold text-green-900 leading-tight">
                  {test.title_method}
                </h4>
                <p className="text-xs text-gray-600">
                  Manual: {test.test_method}
                  {test.page_no && ` / Page: ${test.page_no}`}
                </p>
                
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTest(test)}
                    className={`!px-3 !py-1.5 !text-xs ${
                      selectedTests.includes(test) 
                        ? "!bg-green-600 !text-white !border-green-500" 
                        : ""
                    }`}
                  >
                    {selectedTests.includes(test) ? "Selected" : "Select"}
                  </Button>
                
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons - Floating at Bottom */}
        <div className="sticky bottom-0 flex items-center justify-between mt-6 pt-5 border-t border-gray-200 bg-gray-50 shadow-lg z-20">
          <Button
            variant="outline"
            onClick={() => {
              if (bookingState.selectedCategory) {
                bookingState.selectedCategory.product_category = "";
                bookingState.selectedCategory.product_key = "";
              }
              navigate("/", { state: bookingState });
            }}
            leftIcon={<ArrowLeft size={18} />}
          >
            Back
          </Button>
          
          <div className={selectedTests.length > 0 ? "bg-green-600 rounded-md" : ""}>
            <Button
              variant="primary"
              disabled={selectedTests.length === 0}
              onClick={handleViewLabs}
              rightIcon={<ArrowRight size={18} />}
              className={selectedTests.length > 0 ? "!bg-green-600 !text-white hover:!bg-green-700" : ""}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTests;
