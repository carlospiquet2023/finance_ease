
import { useState, useEffect } from "react";
import { TransactionList } from "@/components/finance/TransactionList";
import { FinancialSummary } from "@/components/finance/FinancialSummary";
import { ExpenseChart } from "@/components/finance/ExpenseChart";
import { RecentActivity } from "@/components/finance/RecentActivity";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { Transaction } from "@/types/finance";
import { calculateTotals, getInitialTransactions } from "@/lib/finance-utils";
import { Card } from "@/components/ui/card";

const DashboardPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { totalIncome, totalExpenses, balance } = calculateTotals(transactions);

  useEffect(() => {
    // Load initial transactions or from localStorage
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

  useEffect(() => {
    // Save to localStorage whenever transactions change
    if (transactions.length > 0) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID()
    };
    
    setTransactions([...transactions, newTransaction]);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <FinancialSummary
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        balance={balance}
      />
      
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <ExpenseChart transactions={transactions} />
        <RecentActivity transactions={transactions} />
      </div>
      
      <div className="mt-6">
        <TransactionList transactions={transactions} />
      </div>
      
      <TransactionForm onAddTransaction={handleAddTransaction} />
    </div>
  );
};

export default DashboardPage;
