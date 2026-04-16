import { useNavigate } from "react-router-dom";
import Stepper from "../../components/Stepper";
import { useEffect, useRef, useState } from "react";
import type { Category } from "../../types/Interfaces";
import { ChevronDown, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import Button from "../../components/Button";

export default function ProductDetails() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [menuMaxHeight, setMenuMaxHeight] = useState<number>(240);
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);  

  // Fetch products when category selected
  const handleCategoryChange = (productKey: string) => {
    const category = categories.find((cat) => cat.product_key === productKey);
    setSelectedCategory(category);
    setIsOpen(false);
  };
  
  // Compute how much space is available from trigger to footer so menu scrolls within it
  const recalcMenuMaxHeight = () => {
    if (!triggerRef.current || !footerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const footerRect = footerRef.current.getBoundingClientRect();
    const space = footerRect.top - triggerRect.bottom - 12; // padding gap
    if (space > 120) {
      setMenuMaxHeight(space);
    } else {
      setMenuMaxHeight(120);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    recalcMenuMaxHeight();
    const onResize = () => recalcMenuMaxHeight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen]);

  // Close on outside click when menu open
  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isOpen]);
  
  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col">
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
      <div ref={cardRef} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex-1 flex flex-col overflow-visible">
        <div className="max-w-none flex-1 flex flex-col">
          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Select Product Category</h2>
            <p className="text-sm text-gray-600">Category*</p>
          </div>

          {/* Category Selection */}
          <div className="space-y-5 flex-1 flex flex-col">
            <div>
              <div ref={triggerRef} className="relative">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsOpen((v) => !v)}
                  className={`w-full text-left bg-white border border-gray-200 rounded-md px-4 py-3 pr-10 text-gray-900 transition-all ${isOpen ? 'ring-2 ring-green-500 border-transparent' : ''}`}
                >
                  {selectedCategory ? selectedCategory.product_category : 'Select'}
                </button>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />

                {isOpen && (
                  <div
                    className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 overflow-y-auto"
                    style={{ maxHeight: menuMaxHeight }}
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat.product_key}
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                        onClick={() => handleCategoryChange(cat.product_key)}
                      >
                        {cat.product_category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* flexible filler to keep footer visible without scrolling */}
              <div className="flex-1" />
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-green-600">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm">Loading categories...</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div ref={footerRef} className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
            <Button
              variant="outline"
              size="md"
              disabled
              leftIcon={<ArrowLeft size={18} />}
            >
              Back
            </Button>
            
            <div className={selectedCategory ? "bg-green-600 rounded-md" : ""}>
              <Button
                variant="primary"
                disabled={!selectedCategory}
                onClick={() =>
                  navigate("/tests", {
                    state: { selectedCategory },
                  })
                }
                rightIcon={<ArrowRight size={18} />}
                className={selectedCategory ? "!bg-green-600 !text-white hover:!bg-green-700" : ""}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
