"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { PAYMENT_METHODS, TXN_STATUSES } from "@/lib/constants";
import { useDebounce } from "@/hooks/use-debounce";

type Row = {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  cardBrand: string | null;
  fee: number;
  createdAt: string;
};

type ApiResponse = { rows: Row[]; total: number; pageCount: number };

export function TransactionsTable() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const q = useDebounce(search, 300);
  const sort = sorting[0];

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "transactions",
      { page, pageSize, q, status, method, sortBy: sort?.id, sortDir: sort?.desc },
    ],
    queryFn: async (): Promise<ApiResponse> => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        q,
        status,
        method,
        sortBy: sort?.id ?? "createdAt",
        sortDir: sort?.desc ? "desc" : "asc",
      });
      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load transactions");
      return res.json();
    },
    placeholderData: keepPreviousData,
  });

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "merchant",
        header: "Merchant",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.merchant}</span>
        ),
      },
      {
        accessorKey: "method",
        header: "Method",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.method}
            {row.original.cardBrand ? ` · ${row.original.cardBrand}` : ""}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge status={row.original.status} />,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {formatCurrency(row.original.amount, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: "fee",
        header: "Fee",
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {formatCurrency(row.original.fee, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: data?.rows ?? [],
    columns,
    pageCount: data?.pageCount ?? 0,
    state: { sorting },
    onSortingChange: (updater) => {
      setSorting(updater);
      setPage(0);
    },
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const total = data?.total ?? 0;
  const pageCount = data?.pageCount ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search merchant..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All statuses</option>
            {TXN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="text-left text-xs uppercase tracking-wide text-muted-foreground"
              >
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <th key={header.id} className="whitespace-nowrap px-4 py-3 font-medium">
                      {canSort ? (
                        <button
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="border-t">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-t transition-colors hover:bg-muted/40",
                    isFetching && "opacity-60",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          {total} transactions · page {page + 1} of {pageCount}
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            size="icon"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={page + 1 >= pageCount}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
