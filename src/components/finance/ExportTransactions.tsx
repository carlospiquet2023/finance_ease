
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Printer, FileSpreadsheet } from "lucide-react";
import { Transaction } from "@/types/finance";
import { formatCurrency, formatDate, translateCategory, calculateTotals } from "@/lib/finance-utils";
import { useToast } from "@/hooks/use-toast";

interface ExportTransactionsProps {
  transactions: Transaction[];
}

export function ExportTransactions({ transactions }: ExportTransactionsProps) {
  const { toast } = useToast();
  
  const generateHTML = (excelStyle: boolean = false) => {
    // Organizar transações por data (mais recente primeiro)
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Calcular totais para exibir no resumo
    const { totalIncome, totalExpenses, balance } = calculateTotals(transactions);
    
    let tableStyles = `
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .income { color: #4ade80; }
      .expense { color: #ef4444; }
      .financial-summary { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9; }
      .summary-item { margin-bottom: 8px; }
      .summary-label { font-weight: bold; display: inline-block; width: 100px; }
    `;
    
    if (excelStyle) {
      tableStyles += `
        body { font-family: 'Calibri', sans-serif; }
        table { border: 1px solid #ccc; }
        th { background-color: #f0f0f0; font-weight: bold; border: 1px solid #ccc; }
        td { border: 1px solid #ccc; }
        h1 { background-color: #4472C4; color: white; padding: 10px; }
        .export-date { color: #666; }
        .financial-summary { background-color: #e6f0ff; border: 1px solid #b8d6ff; }
      `;
    }
    
    let html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Transações FinanceEase</title>
        <style>
          body { font-family: Arial, sans-serif; }
          ${tableStyles}
          h1 { text-align: center; color: #333; }
          .export-date { text-align: right; color: #666; font-size: 12px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Transações FinanceEase</h1>
        <p class="export-date">Exportado em: ${new Date().toLocaleDateString('pt-BR')}</p>
        
        <div class="financial-summary">
          <div class="summary-item">
            <span class="summary-label">Receitas:</span>
            <span class="income">${formatCurrency(totalIncome)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Despesas:</span>
            <span class="expense">${formatCurrency(totalExpenses)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Saldo:</span>
            <span class="${balance >= 0 ? 'income' : 'expense'}">${formatCurrency(balance)}</span>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    sortedTransactions.forEach(transaction => {
      const typeClass = transaction.type === 'income' ? 'income' : 'expense';
      const typeLabel = transaction.type === 'income' ? 'Receita' : 'Despesa';
      const sign = transaction.type === 'income' ? '+' : '-';
      
      html += `
        <tr>
          <td>${formatDate(transaction.date)}</td>
          <td>${transaction.description}</td>
          <td>${translateCategory(transaction.category)}</td>
          <td>${typeLabel}</td>
          <td class="${typeClass}">${sign} ${formatCurrency(transaction.amount)}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    return html;
  };
  
  const exportHTML = (excelStyle: boolean = false) => {
    const html = generateHTML(excelStyle);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeease_transacoes_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportação concluída",
      description: `Transações exportadas em formato HTML ${excelStyle ? 'estilo Excel' : ''}`
    });
  };
  
  const exportPDF = () => {
    const html = generateHTML(true);
    
    // Usar window.print() como uma forma simples de gerar PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Esperar o conteúdo carregar antes de imprimir
      printWindow.onload = function() {
        printWindow.print();
        // Não fechar a janela para dar ao usuário a chance de salvar como PDF
      };
    } else {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível abrir uma nova janela. Verifique se os pop-ups estão permitidos.",
        variant: "destructive"
      });
    }
    
    toast({
      title: "Exportação iniciada",
      description: "Escolha a opção 'Salvar como PDF' na janela de impressão"
    });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="md:w-auto w-full">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportHTML(false)}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar como HTML
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportHTML(true)}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar estilo Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF}>
          <Printer className="mr-2 h-4 w-4" />
          Exportar como PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
