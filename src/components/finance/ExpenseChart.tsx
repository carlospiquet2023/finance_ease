
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types/finance";
import { getCategoryDetails } from "@/lib/finance-utils";

interface ExpenseChartProps {
  transactions: Transaction[];
}

export function ExpenseChart({ transactions }: ExpenseChartProps) {
  const expenses = transactions.filter(t => t.type === 'expense');
  
  // Group expenses by category
  const categoryExpenses = expenses.reduce((acc, transaction) => {
    const { category, amount } = transaction;
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    
    acc[category] += amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Convert to array for chart
  const chartData = Object.entries(categoryExpenses).map(([category, value]) => ({
    name: category,
    value,
    color: getCategoryDetails(category as any).color
  }));
  
  // Sort by value (highest first)
  chartData.sort((a, b) => b.value - a.value);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Sem despesas para mostrar
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name }) => {
                  const category = name as any;
                  return getCategoryDetails(category).icon;
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                labelFormatter={(label) => {
                  const category = label as any;
                  return category.charAt(0).toUpperCase() + category.slice(1);
                }}
              />
              <Legend
                formatter={(value) => {
                  return value.charAt(0).toUpperCase() + value.slice(1);
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
