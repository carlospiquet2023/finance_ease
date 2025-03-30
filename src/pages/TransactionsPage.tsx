
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { TransactionList } from "@/components/finance/TransactionList";
import { ExportTransactions } from "@/components/finance/ExportTransactions";
import { ImportTransactions } from "@/components/finance/ImportTransactions";
import { Transaction } from "@/types/finance";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const loadTransactions = () => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions);
      // Convert date strings back to Date objects
      const formattedTransactions = parsedTransactions.map((transaction: any) => ({
        ...transaction,
        date: new Date(transaction.date)
      }));
      setTransactions(formattedTransactions);
    }
  };
  
  useEffect(() => {
    loadTransactions();
  }, []);
  
  const handleTransactionAdded = (newTransaction: Transaction) => {
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Transações</h1>
      
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:justify-end gap-2 mb-4">
                <ImportTransactions onImportComplete={loadTransactions} />
                <ExportTransactions transactions={transactions} />
              </div>
              <TransactionList transactions={transactions} />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Nova Transação</h2>
              <TransactionForm onAddTransaction={handleTransactionAdded} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
