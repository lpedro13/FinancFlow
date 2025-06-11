import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate, parseDate } from '@/utils/formatters';
import { isValid } from 'date-fns';

const exportToPdf = (reportData, categories = [], investmentTypes = []) => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 20;
  const margin = 15;
  const cellPadding = 2;
  const lineHeight = 7;

  const addPageIfNeeded = (neededHeight) => {
    if (yPos + neededHeight > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  doc.setFontSize(18);
  doc.text('Relatório Financeiro - FinanceFlow', margin, yPos);
  yPos += lineHeight * 2;

  doc.setFontSize(12);
  doc.text(`Período: ${reportData.period.startDate} - ${reportData.period.endDate}`, margin, yPos);
  yPos += lineHeight;
  if (reportData.categoryFilter !== 'all') {
    const categoryName = categories.find(c => c.id === reportData.categoryFilter)?.name || reportData.categoryFilter;
    doc.text(`Filtro de Categoria: ${categoryName}`, margin, yPos);
    yPos += lineHeight;
  }
  yPos += lineHeight / 2;

  addPageIfNeeded(lineHeight * 5);
  doc.setFontSize(14);
  doc.text('Resumo Financeiro', margin, yPos);
  yPos += lineHeight;
  doc.setFontSize(10);
  doc.text(`Total de Receitas: ${formatCurrency(reportData.summary.totalIncome)}`, margin, yPos);
  yPos += lineHeight * 0.8;
  doc.text(`Total de Despesas: ${formatCurrency(reportData.summary.totalExpenses)}`, margin, yPos);
  yPos += lineHeight * 0.8;
  const balance = reportData.summary.totalIncome - reportData.summary.totalExpenses;
  doc.text(`Saldo do Período: ${formatCurrency(balance)}`, margin, yPos, { textColor: balance >= 0 ? '#10b981' : '#ef4444' });
  yPos += lineHeight * 1.5;

  if (reportData.transactions && reportData.transactions.length > 0) {
    addPageIfNeeded(lineHeight * 3 + 20);
    doc.setFontSize(14);
    doc.text('Transações Detalhadas', margin, yPos);
    yPos += lineHeight * 0.5;

    const transactionHeaders = [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']];
    const transactionBody = reportData.transactions.map(t => {
      const categoryName = categories.find(c => c.id === t.category)?.name || t.category;
      const tDate = parseDate(t.date);
      return [
        isValid(tDate) ? formatDate(tDate) : 'Data Inválida',
        t.description,
        categoryName,
        t.type === 'income' ? 'Receita' : 'Despesa',
        formatCurrency(t.amount)
      ];
    });

    doc.autoTable({
      startY: yPos,
      head: transactionHeaders,
      body: transactionBody,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: [255,255,255] },
      styles: { fontSize: 8, cellPadding: cellPadding },
      didDrawPage: (data) => {
        yPos = data.cursor.y + lineHeight; 
      }
    });
    yPos = doc.lastAutoTable.finalY + lineHeight;
  }

  if (reportData.investments && reportData.investments.length > 0) {
    addPageIfNeeded(lineHeight * 3 + 20);
    doc.setFontSize(14);
    doc.text('Investimentos no Período', margin, yPos);
    yPos += lineHeight * 0.5;

    const investmentHeaders = [['Data', 'Nome', 'Tipo', 'Qtd.', 'Valor Invest.', 'Valor Atual', 'Dividendos']];
    const investmentBody = reportData.investments.map(inv => {
      const typeName = investmentTypes.find(it => it.id === inv.type)?.name || inv.type;
      const invDate = parseDate(inv.date);
      return [
        isValid(invDate) ? formatDate(invDate) : 'Data Inválida',
        inv.name,
        typeName,
        inv.quantity,
        formatCurrency(inv.totalInvested),
        formatCurrency(inv.currentValue),
        formatCurrency(inv.dividends || 0)
      ];
    });

    doc.autoTable({
      startY: yPos,
      head: investmentHeaders,
      body: investmentBody,
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96], textColor: [255,255,255] },
      styles: { fontSize: 8, cellPadding: cellPadding },
      didDrawPage: (data) => {
        yPos = data.cursor.y + lineHeight;
      }
    });
    yPos = doc.lastAutoTable.finalY + lineHeight;
  }

  addPageIfNeeded(lineHeight * 2);
  doc.setFontSize(8);
  doc.text(`Relatório gerado em: ${formatDate(new Date(), { dateStyle: 'full', timeStyle: 'short' })}`, margin, pageHeight - 10);

  doc.save(`Relatorio_FinanceFlow_${formatDate(new Date(), {year:'numeric',month:'2-digit',day:'2-digit'})}.pdf`);
};

export default exportToPdf;