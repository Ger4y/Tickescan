import React from 'react';
import { ReceiptData } from '../types';
import { useLanguage } from '../LanguageContext';

interface HistoryProps {
  data: ReceiptData[];
  onBack: () => void;
  onClear: () => void;
  onDeleteOne?: (id: string) => void;
}

const History: React.FC<HistoryProps> = ({ data, onBack, onClear, onDeleteOne }) => {
  const { t } = useLanguage();
  
  // Helper to parse currency strictly (handles 1.000,00 vs 1,000.00)
  const parseAmount = (str: string): number => {
    if (!str) return 0;
    // Remove currency symbols and spaces
    let clean = str.replace(/[^0-9.,-]/g, '').trim();
    
    // Check format: 
    // If it contains both dots and commas, logic:
    // 1.200,50 -> Comma is decimal
    // 1,200.50 -> Dot is decimal
    const lastComma = clean.lastIndexOf(',');
    const lastDot = clean.lastIndexOf('.');

    if (lastComma > -1 && lastDot > -1) {
      if (lastComma > lastDot) {
        // European: 1.200,50 -> Remove dots, replace comma with dot
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        // US: 1,200.50 -> Remove commas
        clean = clean.replace(/,/g, '');
      }
    } else if (lastComma > -1) {
      // Only comma? Assume it's a decimal separator if it looks like decimal (12,50) 
      // or thousands if it's like (1,000). Usually in receipts, if only one exists, 
      // simply replacing comma with dot is safer for JS parseFloat
      clean = clean.replace(',', '.');
    }
    
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  };

  const totalAmount = data.reduce((sum, item) => sum + parseAmount(item.amount), 0);

  // Function to strip accents and special chars strictly, BUT KEEP NEWLINES
  const normalizeText = (text: string | undefined): string => {
    if (!text) return "";
    return text
      .normalize("NFD") // Decompose chars (e.g., 'ñ' -> 'n' + '~')
      .replace(/[\u0300-\u036f]/g, "") // Remove the accent marks
      // Keep alphanumeric, punctuation, spaces, AND newlines (\n, \r)
      .replace(/[^a-zA-Z0-9 .,:;\-\/()\n\r]/g, ""); 
  };

  const downloadCSV = () => {
    // Dynamic CSV Header based on what fields exist in data
    const hasItemCount = data.some(d => d.itemCount);
    const hasCategory = data.some(d => d.category);
    const hasNotes = data.some(d => d.notes);
    const hasItems = data.some(d => d.items && d.items.length > 0);

    // HEADERS: Normalized to pure ASCII using translated headers
    let headers = [t.csvHeaders.date, t.csvHeaders.establishment, t.csvHeaders.amount, t.csvHeaders.payer];
    if (hasItemCount) headers.push(t.csvHeaders.count); 
    if (hasCategory) headers.push(t.csvHeaders.category);
    if (hasNotes) headers.push(t.csvHeaders.notes);       
    if (hasItems) headers.push(t.csvHeaders.details);

    let csvContent = headers.join(",") + "\n";

    // CSV Rows
    data.forEach(row => {
      // Helper to escape double quotes for CSV and normalize text
      const safe = (str: string) => normalizeText(str).replace(/"/g, '""');

      let rowData = [
        `"${safe(row.date)}"`,
        `"${safe(row.establishment)}"`,
        `"${safe(row.amount)}"`,
        `"${safe(row.payer)}"`
      ];

      if (hasItemCount) rowData.push(`"${safe(row.itemCount || '')}"`);
      if (hasCategory) rowData.push(`"${safe(row.category || '')}"`);
      if (hasNotes) rowData.push(`"${safe(row.notes || '')}"`);
      
      if (hasItems) {
        // Use hyphens and newlines inside the quote
        const itemsStr = row.items 
          ? row.items.map(i => `- ${i.description}: ${i.price}`).join("\n")
          : "";
        rowData.push(`"${safe(itemsStr)}"`);
      }

      csvContent += rowData.join(",") + "\n";
    });

    // ADD TOTAL ROW AT THE BOTTOM
    const totalLabel = t.csvHeaders.totalFinal;
    const totalValue = totalAmount.toFixed(2);
    
    let totalRow = [
      "", // Date column empty
      `"${totalLabel}"`, // Establishment column has label
      `"${totalValue}"`, // Amount column has value
      "" // Payer column empty
    ];
    
    // Fill remaining columns with empty strings
    if (hasItemCount) totalRow.push("");
    if (hasCategory) totalRow.push("");
    if (hasNotes) totalRow.push("");
    if (hasItems) totalRow.push("");

    csvContent += totalRow.join(",") + "\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tickets_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    onClear();
  };

  const handleDeleteItem = (id: string) => {
    if (onDeleteOne) onDeleteOne(id);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in bg-gray-50">
      <div className="bg-white p-4 shadow-sm z-10 border-b border-gray-100 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">📋 {t.historyTitle}</h2>
          <p className="text-xs text-gray-500">{data.length} {t.ticketsSaved}</p>
        </div>
        <button 
          onClick={onBack}
          className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p>{t.noTickets}</p>
            <button onClick={onBack} className="mt-4 text-indigo-600 font-bold hover:underline">
              {t.scanFirst}
            </button>
          </div>
        ) : (
          data.slice().reverse().map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 relative group overflow-hidden">
              <div className="flex justify-between items-start mb-1 pr-10">
                <h4 className="font-bold text-gray-900 leading-tight truncate">{item.establishment || "Desconocido"}</h4>
                <div className="font-mono font-bold text-indigo-700 text-lg whitespace-nowrap ml-2">{item.amount}</div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>{item.date} {item.payer ? `• ${item.payer}` : ''}</span>
                {item.items && <span>{item.items.length} arts.</span>}
              </div>
              {item.notes && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 italic">
                  📝 {item.notes}
                </div>
              )}
              
              {onDeleteOne && (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  className="absolute top-0 right-0 p-3 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors z-20 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {data.length > 0 && (
        <div className="bg-white p-4 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0 z-20">
          <div className="flex justify-between items-center mb-4 px-1">
            <span className="text-gray-700 font-bold">{t.totalEstimated}</span>
            <span className="text-2xl font-black text-gray-900">{totalAmount.toFixed(2)}</span>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={downloadCSV}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200 active:scale-98"
            >
              <span>📊</span> {t.exportCSV}
            </button>
            
            <button 
              onClick={handleClear}
              className="w-full text-red-600 font-semibold text-sm py-3 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100 active:bg-red-100"
            >
              {t.clearHistory}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;