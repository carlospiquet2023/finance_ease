
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types/finance";
import { formatCurrency, formatDate, getCategoryDetails, getInitialTransactions } from "@/lib/finance-utils";
import { Badge } from "@/components/ui/badge";

const CalendarPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDayTransactions, setSelectedDayTransactions] = useState<Transaction[]>([]);

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

  useEffect(() => {
    // Filter transactions for selected date
    if (date) {
      const selectedDay = new Date(date);
      const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getDate() === selectedDay.getDate() &&
          transactionDate.getMonth() === selectedDay.getMonth() &&
          transactionDate.getFullYear() === selectedDay.getFullYear()
        );
      });
      setSelectedDayTransactions(filteredTransactions);
    }
  }, [date, transactions]);

  // Function to check if a date has transactions
  const hasTransactions = (day: Date) => {
    return transactions.some(t => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getDate() === day.getDate() &&
        transactionDate.getMonth() === day.getMonth() &&
        transactionDate.getFullYear() === day.getFullYear()
      );
    });
  };

  // Calculate income/expenses for the selected day
  const totalIncome = selectedDayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = selectedDayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Calendário Financeiro</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendário de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              className="rounded-md border"
              modifiersClassNames={{
                selected: "bg-primary text-primary-foreground",
              }}
              modifiers={{
                hasTransactions: (day) => hasTransactions(day)
              }}
              components={{
                DayContent: (props) => {
                  const hasTransaction = hasTransactions(props.date);
                  
                  return (
                    <div className="relative">
                      <div>{props.date.getDate()}</div>
                      {hasTransaction && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </div>
                  );
                }
              }}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              Transações em {formatDate(date)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayTransactions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                Nenhuma transação neste dia
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Receitas</div>
                    <div className="text-lg font-medium income-text">{formatCurrency(totalIncome)}</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Despesas</div>
                    <div className="text-lg font-medium expense-text">{formatCurrency(totalExpenses)}</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Saldo</div>
                    <div className={`text-lg font-medium ${balance >= 0 ? 'income-text' : 'expense-text'}`}>
                      {formatCurrency(balance)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {selectedDayTransactions.map((transaction) => {
                    const categoryDetails = getCategoryDetails(transaction.category);
                    
                    return (
                      <div 
                        key={transaction.id} 
                        className="finance-card flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white"
                            style={{ backgroundColor: categoryDetails.color }}
                          >
                            <span>{categoryDetails.icon}</span>
                          </div>
                          <div>
                            <h3 className="font-medium">{transaction.description}</h3>
                            <Badge variant="outline" className="capitalize">
                              {transaction.category}
                            </Badge>
                          </div>
                        </div>
                        <span className={transaction.type === 'income' ? 'income-text' : 'expense-text'}>
                          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
