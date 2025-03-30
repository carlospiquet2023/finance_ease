
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getInitialTransactions } from "@/lib/finance-utils";
import { useToast } from "@/hooks/use-toast";
import { Trash, Upload } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const SettingsPage = () => {
  const { toast } = useToast();
  const [hasTransactions, setHasTransactions] = useState(false);
  const [hasBudgets, setHasBudgets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    setHasTransactions(!!savedTransactions);
    
    const savedBudgets = localStorage.getItem('budgets');
    setHasBudgets(!!savedBudgets);
  }, []);

  const handleResetTransactions = () => {
    localStorage.removeItem('transactions');
    localStorage.setItem('transactions', JSON.stringify(getInitialTransactions()));
    setHasTransactions(true);
    
    toast({
      title: "Dados resetados",
      description: "Transações foram restauradas para o estado inicial"
    });
  };

  const handleClearTransactions = () => {
    localStorage.removeItem('transactions');
    setHasTransactions(false);
    
    toast({
      title: "Dados apagados",
      description: "Todas as transações foram removidas"
    });
  };

  const handleClearBudgets = () => {
    localStorage.removeItem('budgets');
    setHasBudgets(false);
    
    toast({
      title: "Orçamentos apagados",
      description: "Todos os orçamentos foram removidos"
    });
  };

  const handleExportData = () => {
    const data = {
      transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
      budgets: JSON.parse(localStorage.getItem('budgets') || '[]')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeease_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Dados exportados",
      description: "Seus dados foram exportados com sucesso"
    });
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate data structure
        if (!data || ((!Array.isArray(data.transactions) || data.transactions.length === 0) && 
                      (!Array.isArray(data.budgets) || data.budgets.length === 0))) {
          throw new Error("Formato de arquivo inválido ou vazio");
        }
        
        // Convert date strings back to Date objects for transactions
        if (data.transactions && Array.isArray(data.transactions)) {
          data.transactions = data.transactions.map((transaction: any) => ({
            ...transaction,
            date: new Date(transaction.date)
          }));
          localStorage.setItem('transactions', JSON.stringify(data.transactions));
          setHasTransactions(true);
        }
        
        // Save budgets if present
        if (data.budgets && Array.isArray(data.budgets)) {
          localStorage.setItem('budgets', JSON.stringify(data.budgets));
          setHasBudgets(true);
        }
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Notify success
        toast({
          title: "Importação concluída",
          description: "Seus dados foram restaurados com sucesso!"
        });
        
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Erro na importação",
          description: error instanceof Error ? error.message : "Formato de arquivo inválido",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Dados</CardTitle>
            <CardDescription>
              Controle como seus dados são armazenados e gerenciados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Transações</Label>
              <p className="text-sm text-muted-foreground">
                {hasTransactions 
                  ? "Você tem transações salvas no aplicativo."
                  : "Você não tem transações salvas."}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Orçamentos</Label>
              <p className="text-sm text-muted-foreground">
                {hasBudgets 
                  ? "Você tem orçamentos configurados."
                  : "Você não configurou nenhum orçamento."}
              </p>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              style={{ display: 'none' }} 
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="flex space-x-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleResetTransactions}
              >
                Restaurar Dados Padrão
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleExportData}
                disabled={!hasTransactions && !hasBudgets}
              >
                Exportar Dados
              </Button>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleImportClick}
            >
              <Upload className="mr-2 h-4 w-4" />
              Importar Backup
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <Trash className="mr-2 h-5 w-5" />
              Zona de Perigo
            </CardTitle>
            <CardDescription>
              Ações que não podem ser desfeitas. Tenha cuidado!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  disabled={!hasTransactions}
                >
                  Apagar Todas as Transações
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isto irá apagar permanentemente todas as suas transações.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearTransactions}>
                    Sim, apagar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  disabled={!hasBudgets}
                >
                  Apagar Todos os Orçamentos
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isto irá apagar permanentemente todos os seus orçamentos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearBudgets}>
                    Sim, apagar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sobre o FinanceEase</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            FinanceEase é um aplicativo de gerenciamento financeiro pessoal desenvolvido para ajudá-lo a controlar suas finanças de forma simples e eficaz.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Versão 1.0.0
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
