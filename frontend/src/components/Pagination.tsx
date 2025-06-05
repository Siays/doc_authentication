import React from "react";
import ReactPaginate from "react-paginate";

interface PaginationProps {
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (selectedPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  itemsPerPage,
  totalItems,
  onPageChange,
}) => {
  const pageCount = Math.ceil(totalItems / itemsPerPage);

  return (
    <ReactPaginate
      previousLabel="<"
      nextLabel=">"
      breakLabel="..."
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={(selectedItem) => onPageChange(selectedItem.selected)}
      containerClassName="flex justify-center gap-2 mt-4"
      pageClassName="px-3 py-1 border rounded hover:bg-blue-100"
      previousClassName="px-3 py-1 border rounded hover:bg-blue-100"
      nextClassName="px-3 py-1 border rounded hover:bg-blue-100"
      breakClassName="px-3 py-1"
      activeClassName="bg-blue-500 text-white"
      disabledClassName="opacity-50 cursor-not-allowed"
    />
  );
};

export default Pagination;
