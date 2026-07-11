import { TransactionsTable } from "@/components/transactions/transactions-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TransactionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All transactions</CardTitle>
        <CardDescription>
          Search, filter, sort, and page through every payment — powered by
          server-side pagination.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TransactionsTable />
      </CardContent>
    </Card>
  );
}
