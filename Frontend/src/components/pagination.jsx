import React from "react";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { Button } from "./ui/button";

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Trang <span className="font-medium">{page}</span> / {totalPages} • Tổng{" "}
        <span className="font-medium">{total}</span> mục
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent"
          onClick={() => onPageChange(1)}
          disabled={!canPrev}
          title="Trang đầu"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="bg-transparent"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="mx-2 text-sm">
          {page}
        </span>

        <Button
          variant="outline"
          size="sm"
          className="bg-transparent"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          title="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="bg-transparent"
          onClick={() => onPageChange(totalPages)}
          disabled={!canNext}
          title="Trang cuối"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
