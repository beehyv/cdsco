import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { BookingState } from "../types/Interfaces";
import { useMemo } from "react";

type Crumb = { label: string; path: string; tooltip?: string };

const Breadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const state = location.state as BookingState | undefined;

  const crumbs: Crumb[] = useMemo(() => {
    const arr: Crumb[] = [];
    arr.push({ label: "Home", path: "/" });

    // Handle different routes
    if (location.pathname === "/allLabs") {
      arr.push({ label: "All Laboratories", path: "/allLabs" });
    } else if (location.pathname.startsWith("/labs/") && location.pathname.endsWith("/tests")) {
      // LabTests page
      const labId = params.labId;
      arr.push({ label: "All Laboratories", path: "/allLabs" });
      arr.push({ 
        label: `Lab Tests`, 
        tooltip: labId ? `Tests for Lab ID: ${labId}` : "Laboratory Tests",
        path: location.pathname 
      });
    } else {
      // Original LabsFinder flow
      if (state?.selectedCategory?.product_category) {
        arr.push({ label: state.selectedCategory.product_category, path: "/tests" });
      }

      if (state?.selectedTests?.length) {
        const allMethods = state.selectedTests.map((t) => t.title_method).join(", ");
        arr.push({
          label: state.selectedTests[0].title_method,
          tooltip: allMethods,
          path: "/labs",
        });
      }
    }

    return arr;
  }, [state, location.pathname, params.labId]);

  if (crumbs.length === 0) return null;

  const handleNavigate = (path: string) => {
    // For Labs/LabTests routes, navigate without state
    if (path === "/allLabs" || path.startsWith("/labs/")) {
      navigate(path);
      return;
    }

    // For LabsFinder flow, handle state
    let newState: BookingState | undefined = { ...state };

    if (path === "/tests") {
      // Clear selected tests
      newState = { ...newState, selectedTests: [] };
    }

    if (path === "/") {
      // Clear category and tests
      newState = undefined;
    }

    navigate(path, { state: newState });
  };

  return (
    <nav className="text-sm text-gray-600 mb-4">
      <ol className="flex gap-2 items-center">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={index} className="flex items-center gap-2 max-w-[150px]">
              <button
                onClick={() => handleNavigate(crumb.path)}
                title={crumb.tooltip ?? crumb.label}
                className={`truncate ${
                  isLast
                    ? "font-bold text-gray-900 cursor-default"
                    : "text-blue-600 hover:underline"
                }`}
                disabled={isLast}
              >
                {crumb.label}
              </button>
              {!isLast && <span>{">>"}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
