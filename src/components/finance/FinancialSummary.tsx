
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/finance-utils";

interface FinancialSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export function FinancialSummary({ totalIncome, totalExpenses, balance }: FinancialSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          <ArrowUp className="h-4 w-4 text-finance-income" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold income-text">{formatCurrency(totalIncome)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          <ArrowDown className="h-4 w-4 text-finance-expense" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold expense-text">{formatCurrency(totalExpenses)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          <Wallet className="h-4 w-4 text-finance-neutral" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'income-text' : 'expense-text'}`}>
            {formatCurrency(balance)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
