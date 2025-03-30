import { useState, useEffect } from "react";
import { Category, Transaction } from "@/types/finance";
import { sampleCategories, formatCurrency, getInitialTransactions } from "@/lib/finance-utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Budget {
  category: Category;
  limit: number;
}

const BudgetsPage = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [budgetLimit, setBudgetLimit] = useState("");

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions);
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

    const savedBudgets = localStorage.getItem('budgets');
    if (savedBudgets) {
      try {
        const parsedBudgets = JSON.parse(savedBudgets);
        setBudgets(parsedBudgets);
      } catch (e) {
        console.error("Error loading budgets", e);
        setBudgets([]);
      }
    }
  }, []);

  useEffect(() => {
    if (budgets.length > 0) {
      localStorage.setItem('budgets', JSON.stringify(budgets));
    }
  }, [budgets]);

  const saveBudget = (category: Category) => {
    const amount = parseFloat(budgetLimit);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, digite um valor válido maior que zero",
        variant: "destructive"
      });
      return;
    }
    
    const existingBudgetIndex = budgets.findIndex(b => b.category === category);
    
    if (existingBudgetIndex >= 0) {
      const updatedBudgets = [...budgets];
      updatedBudgets[existingBudgetIndex] = { category, limit: amount };
      setBudgets(updatedBudgets);
    } else {
      setBudgets([...budgets, { category, limit: amount }]);
    }
    
    setEditingCategory(null);
    setBudgetLimit("");
    
    toast({
      title: "Orçamento salvo",
      description: `Orçamento para ${category} foi definido como ${formatCurrency(amount)}`
    });
  };

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const thisMonthExpenses = transactions.filter(t => 
    t.type === 'expense' && new Date(t.date) >= startOfMonth
  );
  
  const spendingByCategory = thisMonthExpenses.reduce((acc, transaction) => {
    const { category, amount } = transaction;
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    
    acc[category] += amount;
    return acc;
  }, {} as Record<string, number>);

  const budgetData = sampleCategories
    .filter(cat => cat.name !== 'income')
    .map(category => {
      const budget = budgets.find(b => b.category === category.name);
      const spent = spendingByCategory[category.name] || 0;
      const limit = budget?.limit || 0;
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      
      return {
        ...category,
        spent,
        limit,
        percentage: Math.min(percentage, 100),
        overBudget: spent > limit && limit > 0
      };
    })
    .sort((a, b) => {
      const aHasBudget = a.limit > 0;
      const bHasBudget = b.limit > 0;
      
      if (aHasBudget !== bHasBudget) {
        return aHasBudget ? -1 : 1;
      }
      
      return b.percentage - a.percentage;
    });

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Orçamentos</h1>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {budgetData.map(category => (
          <Card key={category.name} className={category.overBudget ? 'border-finance-expense' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span 
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-2 text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon}
                  </span>
                  <CardTitle className="capitalize">{category.name}</CardTitle>
                </div>
                {category.limit > 0 && (
                  <CardDescription className={category.overBudget ? 'text-finance-expense' : ''}>
                    {category.percentage.toFixed(0)}%
                  </CardDescription>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingCategory === category.name ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">R$</span>
                    <Input
                      type="number"
                      placeholder="Limite mensal"
                      value={budgetLimit}
                      onChange={(e) => setBudgetLimit(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditingCategory(null);
                        setBudgetLimit("");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => saveBudget(category.name)}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {category.limit > 0 ? (
                    <>
                      <Progress 
                        value={category.percentage} 
                        className={`h-2 mb-2 ${category.overBudget ? 'bg-finance-expense/20' : ''}`}
                        indicatorClassName={category.overBudget ? 'bg-finance-expense' : undefined}
                      />
                      <div className="flex justify-between text-sm">
                        <span>{formatCurrency(category.spent)}</span>
                        <span>de {formatCurrency(category.limit)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-10 text-muted-foreground text-sm">
                      Sem orçamento definido
                    </div>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter className="pt-1">
              {editingCategory !== category.name && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setEditingCategory(category.name);
                    setBudgetLimit(category.limit > 0 ? category.limit.toString() : "");
                  }}
                >
                  {category.limit > 0 ? 'Editar' : 'Definir Orçamento'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BudgetsPage;
