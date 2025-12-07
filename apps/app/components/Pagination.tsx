import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  const getPageButtonClassName = (isCurrent: boolean) =>
    classNames(
      "inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium",
      {
        "border-cyan-500 text-cyan-600": isCurrent,
        "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 cursor-pointer":
          !isCurrent,
      },
    );

  const getNavButtonClassName = (isDisabled: boolean, extraClasses = "") =>
    classNames(
      "inline-flex items-center border-t-2 border-transparent pt-4 text-sm font-medium",
      extraClasses,
      {
        "text-gray-300 cursor-not-allowed": isDisabled,
        "text-gray-500 hover:border-gray-300 hover:text-gray-700 cursor-pointer":
          !isDisabled,
      },
    );

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  const handlePrev = () => {
    if (!isPrevDisabled) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!isNextDisabled) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Maximum number of page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate how many pages to show around current page
      // Reserve 2 slots for first and last page, rest for middle
      const middleCount = maxVisible - 2;
      const halfMiddle = Math.floor(middleCount / 2);

      // Calculate range around current page
      let start = Math.max(2, currentPage - halfMiddle);
      let end = Math.min(totalPages - 1, currentPage + halfMiddle);

      // Adjust if we're near the beginning
      if (currentPage <= halfMiddle + 1) {
        start = 2;
        end = Math.min(totalPages - 1, maxVisible - 1);
      }
      // Adjust if we're near the end
      else if (currentPage >= totalPages - halfMiddle) {
        start = Math.max(2, totalPages - maxVisible + 2);
        end = totalPages - 1;
      }

      // Add left ellipsis if needed
      if (start > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add right ellipsis if needed
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      data-testid="pagination"
      className={`flex items-center justify-between px-4 pb-6 sm:px-0 ${className}`}
    >
      <div className="-mt-px flex w-0 flex-1">
        <button
          onClick={handlePrev}
          disabled={isPrevDisabled}
          className={getNavButtonClassName(isPrevDisabled, "pr-1")}
        >
          <ArrowLongLeftIcon
            aria-hidden="true"
            className={classNames("mr-3 size-5", {
              "text-gray-300": isPrevDisabled,
              "text-gray-400": !isPrevDisabled,
            })}
          />
          Previous
        </button>
      </div>
      <div className="hidden md:-mt-px md:flex">
        {pageNumbers.map((page, index) =>
          typeof page === "number" ? (
            <button
              key={index}
              onClick={() => handlePageClick(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={getPageButtonClassName(page === currentPage)}
            >
              {page}
            </button>
          ) : (
            <span
              key={index}
              className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500"
            >
              {page}
            </span>
          ),
        )}
      </div>
      <div className="-mt-px flex w-0 flex-1 justify-end">
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          className={getNavButtonClassName(isNextDisabled, "pl-1")}
        >
          Next
          <ArrowLongRightIcon
            aria-hidden="true"
            className={classNames("ml-3 size-5", {
              "text-gray-300": isNextDisabled,
              "text-gray-400": !isNextDisabled,
            })}
          />
        </button>
      </div>
    </nav>
  );
}
