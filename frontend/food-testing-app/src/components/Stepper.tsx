import { useLocation, useNavigate } from "react-router-dom";
import type { BookingState} from "../types/Interfaces"

type Step = {
  id: number;
  name: string;
  path: string;
};

const steps: Step[] = [
  { id: 1, name: "Product", path: "/" },
  { id: 2, name: "Tests", path: "/tests" },
  { id: 3, name: "Labs", path: "/labs" },
];

const Stepper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as BookingState;

  const getStepCircleClasses = (isActive: boolean, isCompleted: boolean) => {
    if (isActive) return "bg-green-600 border-green-600 text-white shadow-lg";
    if (isCompleted) return "bg-green-50 border-green-600 text-green-700";
    return "bg-white border-gray-300 text-gray-400";
  };

  const getStepTextClasses = (isActive: boolean, isCompleted: boolean) => {
    if (isActive) return "text-green-700";
    if (isCompleted) return "text-green-700";
    return "text-gray-500";
  };

  const getActiveStep = (): number => {
    if (location.pathname === "/") return 1;
    if (location.pathname.includes("tests")) return 2;
    if (location.pathname.includes("labs")) return 3;
    return 1;
  };

  const activeStep = getActiveStep();

  const handleStepClick = (step: Step) => {
    const isBackward = step.id < activeStep;

    if (isBackward) {
      if (step.id === 1) {
        // going back to Product → clear all state
        navigate(step.path, { replace: true });
      } else if (step.id === 2) {
        // going back to Tests → keep everything except selectedTests
        state.selectedTests = [];
        navigate(step.path, { state: state, replace: true });
      } else {
        // other backward navigation, just go without touching state
        navigate(step.path, { state, replace: true });
      }
    } else {
      // forward navigation → preserve state
      navigate(step.path, { state });
    }
  };

  const getLineStyle = (linePosition: 'left' | 'right') => {
    if (activeStep === 1) {
      // Step 1: Both lines are long dotted
      return { borderTop: '2px dotted #D1D5DB' };
    } else if (activeStep === 2) {
      // Step 2: Left line is extra long dashed, right line is dotted
      if (linePosition === 'left') {
        return {
          borderTop: '2px dashed #9CA3AF',
          borderImage: 'repeating-linear-gradient(to right, #9CA3AF 0, #9CA3AF 8px, transparent 8px, transparent 16px) 1'
        };
      } else {
        return { borderTop: '2px dotted #D1D5DB' };
      }
    } else if (activeStep === 3) {
      // Step 3: Both lines are extra long dashed
      return {
        borderTop: '2px dashed #9CA3AF',
        borderImage: 'repeating-linear-gradient(to right, #9CA3AF 0, #9CA3AF 8px, transparent 8px, transparent 16px) 1'
      };
    }
    return { borderTop: '2px dotted #D1D5DB' };
  };

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Line between step 1 and 2 */}
      <div 
        className="absolute top-5 left-0 w-1/2 z-0"
        style={getLineStyle('left')}
      />
      
      {/* Line between step 2 and 3 */}
      <div 
        className="absolute top-5 right-0 w-1/2 z-0"
        style={getLineStyle('right')}
      />

      {/* Steps with new labels */}
      <div className="relative flex justify-between z-10">
        {steps.map((step) => {
          const isActive = step.id === activeStep;
          const isCompleted = step.id < activeStep;
          const isClickable = step.id <= activeStep;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : 'cursor-default'} group bg-transparent border-none p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg`}
              onClick={() => isClickable && handleStepClick(step)}
            >
              {/* Step circle */}
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-semibold text-sm transition-all duration-200 ${getStepCircleClasses(isActive, isCompleted)} ${isClickable ? 'group-hover:scale-105' : ''}`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>

              {/* Step name */}
              <span
                className={`mt-3 text-sm font-medium transition-colors duration-200 ${getStepTextClasses(isActive, isCompleted)}`}
              >
                {(() => {
                  if (step.id === 1) return 'Product Details';
                  if (step.id === 2) return 'View Tests';
                  return 'Lab Info';
                })()}
              </span>

              {/* Step description for active step */}
              {isActive && (
                <span className="mt-1 text-xs text-gray-500 text-center max-w-20">
                  {step.id === 1 && "Choose category"}
                  {step.id === 2 && "Select tests"}
                  {step.id === 3 && "Pick lab"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
