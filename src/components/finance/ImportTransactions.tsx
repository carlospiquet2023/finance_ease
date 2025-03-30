
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Transaction } from "@/types/finance";

interface ImportTransactionsProps {
  onImportComplete: () => void;
}

export function ImportTransactions({ onImportComplete }: ImportTransactionsProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
        
        // Validar estrutura de dados
        if (!data || ((!Array.isArray(data.transactions) || data.transactions.length === 0) && 
                      (!Array.isArray(data.budgets) || data.budgets.length === 0))) {
          throw new Error("Formato de arquivo inválido ou vazio");
        }
        
        // Converter strings de data de volta para objetos Date para transações
        if (data.transactions && Array.isArray(data.transactions)) {
          data.transactions = data.transactions.map((transaction: any) => ({
            ...transaction,
            date: new Date(transaction.date)
          }));
          localStorage.setItem('transactions', JSON.stringify(data.transactions));
        }
        
        // Salvar orçamentos se presentes
        if (data.budgets && Array.isArray(data.budgets)) {
          localStorage.setItem('budgets', JSON.stringify(data.budgets));
        }
        
        // Resetar input de arquivo
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Notificar sucesso
        toast({
          title: "Importação concluída",
          description: "Seus dados foram restaurados com sucesso!"
        });
        
        // Atualizar a lista de transações
        onImportComplete();
        
      } catch (error) {
        console.error('Erro na importação:', error);
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
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        style={{ display: 'none' }}
      />
      <Button variant="outline" className="md:w-auto w-full" onClick={handleImportClick}>
        <Upload className="mr-2 h-4 w-4" />
        Importar
      </Button>
    </>
  );
}
