
import { Transaction } from "@/types/finance";
import { formatCurrency, formatDate, getCategoryDetails, translateCategory } from "@/lib/finance-utils";
import { Card } from "@/components/ui/card";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Transações Recentes</h2>
      
      {sortedTransactions.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          Nenhuma transação registrada ainda
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedTransactions.map((transaction) => {
            const categoryDetails = getCategoryDetails(transaction.category);
            
            return (
              <Card key={transaction.id} className="finance-card flex justify-between items-center">
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white"
                    style={{ backgroundColor: categoryDetails.color }}
                  >
                    <span>{categoryDetails.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{transaction.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.date)} • <span className="capitalize">{translateCategory(transaction.category)}</span>
                    </p>
                  </div>
                </div>
                <span className={transaction.type === 'income' ? 'income-text' : 'expense-text'}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </span>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
