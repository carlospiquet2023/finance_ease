
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types/finance";
import { formatCurrency } from "@/lib/finance-utils";

interface RecentActivityProps {
  transactions: Transaction[];
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  // Get dates for the last 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();
  
  // Format dates to strings (for comparison)
  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };
  
  // Group transactions by date
  const transactionsByDate = transactions.reduce((acc, transaction) => {
    const dateKey = formatDateKey(new Date(transaction.date));
    
    if (!acc[dateKey]) {
      acc[dateKey] = { income: 0, expense: 0 };
    }
    
    if (transaction.type === 'income') {
      acc[dateKey].income += transaction.amount;
    } else {
      acc[dateKey].expense += transaction.amount;
    }
    
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);
  
  // Create chart data
  const chartData = last7Days.map(date => {
    const dateKey = formatDateKey(date);
    const dayData = transactionsByDate[dateKey] || { income: 0, expense: 0 };
    
    return {
      date: date.toLocaleDateString('pt-BR', { weekday: 'short' }).charAt(0).toUpperCase() + date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(1, 3),
      receitas: dayData.income,
      despesas: dayData.expense
    };
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" />
            <YAxis 
              tickFormatter={(value) => `${value}`}
              width={45}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), '']}
            />
            <Bar dataKey="receitas" name="Receitas" fill="#4ade80" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesas" name="Despesas" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
