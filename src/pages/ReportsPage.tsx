
import { useState, useEffect } from "react";
import { Transaction } from "@/types/finance";
import { FinancialSummary } from "@/components/finance/FinancialSummary";
import { ExpenseChart } from "@/components/finance/ExpenseChart";
import { RecentActivity } from "@/components/finance/RecentActivity";
import { sampleCategories, calculateTotals, formatCurrency, getCategoryDetails, getInitialTransactions } from "@/lib/finance-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ReportsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");
  
  useEffect(() => {
    // Load transactions from localStorage
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions);
        // Convert string dates back to Date objects
        const transactionsWithDates = parsedTransactions.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
        setTransactions(transactionsWithDates);
      } catch (e) {
        console.error("Error loading transactions", e);
        setTransactions(getInitialTransactions());
      }
    } else {
      setTransactions(getInitialTransactions());
    }
  }, []);

  // Filter transactions based on timeframe
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const today = new Date();
    
    if (timeframe === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      return transactionDate >= oneWeekAgo;
    } else if (timeframe === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      return transactionDate >= oneMonthAgo;
    } else {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      return transactionDate >= oneYearAgo;
    }
  });

  const { totalIncome, totalExpenses, balance } = calculateTotals(filteredTransactions);

  // Calculate category breakdown
  const expenses = filteredTransactions.filter(t => t.type === 'expense');
  const categoryExpenses = expenses.reduce((acc, transaction) => {
    const { category, amount } = transaction;
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    
    acc[category] += amount;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array and sort by amount
  const categorySummary = Object.entries(categoryExpenses)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      details: getCategoryDetails(category as any)
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Relatórios</h1>
      
      <Tabs defaultValue="month" className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week" onClick={() => setTimeframe("week")}>Semana</TabsTrigger>
          <TabsTrigger value="month" onClick={() => setTimeframe("month")}>Mês</TabsTrigger>
          <TabsTrigger value="year" onClick={() => setTimeframe("year")}>Ano</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <FinancialSummary
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        balance={balance}
      />
      
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <ExpenseChart transactions={filteredTransactions} />
        <RecentActivity transactions={filteredTransactions} />
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Detalhe de Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {categorySummary.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              Sem despesas para mostrar
            </div>
          ) : (
            <div className="space-y-6">
              {categorySummary.map(({ category, amount, percentage, details }) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span 
                        className="w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs text-white"
                        style={{ backgroundColor: details.color }}
                      >
                        {details.icon}
                      </span>
                      <span className="capitalize">{category}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 font-medium">{formatCurrency(amount)}</span>
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
