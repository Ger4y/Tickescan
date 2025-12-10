import React from 'react';
import { ReceiptData, ReceiptItem, ExtractionSettings } from './types';
import { useLanguage } from './LanguageContext';

interface ReceiptFormProps {
  initialData: ReceiptData;
  settings: ExtractionSettings;
  imagePreview: string;
  onSubmit: (data: ReceiptData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CATEGORIES_KEYS = ["Supermercado", "Hogar", "Gasolina", "Ocio", "Regalos", "Restaurantes", "Personal", "Viajes"] as const;

const parseValue = (val: string): number => {
  if (!val) return 0;
  const normalized = val.replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
};

const formatValue = (num: number): string => {
  return num.toFixed(2);
};

const ReceiptForm: React.FC<ReceiptFormProps> = ({ initialData, settings, imagePreview, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = React.useState<ReceiptData>(initialData);
  const [showItems, setShowItems] = React.useState(false);
  const { t } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const handleItemChange = (index: number, field: keyof ReceiptItem, value: string) => {
    if (!formData.items) return;
    if (field === 'price') {
      const oldPrice = parseValue(formData.items[index].price);
      const newPrice = parseValue(value);
      const diff = newPrice - oldPrice;
      const currentTotal = parseValue(formData.amount);
      const newTotal = currentTotal + diff;
      const newItems = [...formData.items];
      newItems[index] = { ...newItems[index], [field]: value };
      setFormData(prev => ({ ...prev, items: newItems, amount: newTotal > 0 ? formatValue(newTotal) : "0.00" }));
    } else {
      const newItems = [...formData.items];
      newItems[index] = { ...newItems[index], [field]: value };
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({ ...prev, items: [...(prev.items || []), { description: '', price: '' }] }));
    setShowItems(true);
  };

  const removeItem = (index: number) => {
    if (!formData.items) return;
    const itemPrice = parseValue(formData.items[index].price);
    const currentTotal = parseValue(formData.amount);
    const newTotal = currentTotal - itemPrice;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems, amount: newTotal > 0 ? formatValue(newTotal) : "0.00" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const hasExtraFields = settings.extractItemCount || settings.extractCategory;
  const shouldShowItemsList = settings.extractItems || (formData.items && formData.items.length > 0) || showItems;

  return (
    <div className="flex flex-col h-full animate-fade-in bg-gray-50">
      <div className="bg-white p-3 shadow-sm z-10 sticky top-0 flex justify-between items-center">
        <h2 className="font-bold text-gray-900">📝 {t.editData}</h2>
        <button onClick={onCancel} className="text-gray-500 text-sm hover:text-gray-700">{t.cancel}</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {imagePreview && (
          <div className="flex justify-center mb-2">
            <img src={imagePreview} alt="Receipt" className="h-32 object-contain rounded-lg border border-gray-200 bg-white" />
          </div>
        )}

        <form id="receipt-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">📅 {t.date}</label>
              <input type="text" name="date" required value={formData.date} onChange={handleChange} placeholder={t.placeholders.date} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">💰 {t.total}</label>
              <input type="text" name="amount" required value={formData.amount} onChange={handleChange} placeholder={t.placeholders.amount} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-gray-900 bg-white placeholder-gray-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase">🏪 {t.establishment}</label>
            <input type="text" name="establishment" value={formData.establishment} onChange={handleChange} placeholder={t.placeholders.est} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase">👤 {t.payer}</label>
            <input type="text" name="payer" value={formData.payer} onChange={handleChange} placeholder={t.placeholders.payer} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400" />
          </div>

          {hasExtraFields && (
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detalles Adicionales</h3>
              {settings.extractItemCount && (
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase">📦 {t.itemCount}</label>
                  <input type="number" name="itemCount" value={formData.itemCount || ''} onChange={handleChange} placeholder={t.placeholders.count} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500" />
                </div>
              )}
              {settings.extractCategory && (
                 <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">🏷️ {t.category}</label>
                  <input type="text" name="category" value={formData.category || ''} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500" placeholder={t.placeholders.cat} />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {CATEGORIES_KEYS.map(catKey => (
                      <button key={catKey} type="button" onClick={() => handleCategorySelect(catKey)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${formData.category === catKey ? 'bg-indigo-100 text-indigo-700 border-indigo-200 ring-2 ring-indigo-500 ring-offset-1' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>{t.categories[catKey]}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {settings.extractNotes && (
             <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">📝 {t.notes}</label>
              <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder={t.placeholders.notes} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 text-sm min-h-[80px]" />
            </div>
          )}

          {shouldShowItemsList && (
            <div className="bg-gray-100 p-3 rounded-xl border border-gray-200">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-sm font-bold text-gray-700">🛒 {t.items} ({formData.items?.length || 0})</h3>
                 <button type="button" onClick={addItem} className="text-xs bg-white border border-gray-300 px-2 py-1 rounded shadow-sm text-gray-700 hover:bg-gray-50">+ {t.addItem}</button>
               </div>
               <div className="space-y-2">
                 {formData.items?.map((item, idx) => (
                   <div key={idx} className="flex gap-2">
                     <input type="text" value={item.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} className="flex-1 px-2 py-1.5 text-sm rounded border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-indigo-500" placeholder={t.placeholders.itemDesc} />
                     <input type="text" value={item.price} onChange={(e) => handleItemChange(idx, 'price', e.target.value)} className="w-20 px-2 py-1.5 text-sm rounded border border-gray-300 text-right bg-white text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-indigo-500" placeholder={t.placeholders.itemPrice} />
                     <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 font-bold px-1.5 rounded hover:bg-red-50">×</button>
                   </div>
                 ))}
                 {(!formData.items || formData.items.length === 0) && (
                   <div className="text-center py-4 bg-white/50 rounded-lg border border-dashed border-gray-300">
                     <p className="text-xs text-gray-500">{t.emptyList}</p>
                     <button type="button" onClick={addItem} className="mt-1 text-indigo-600 text-xs font-bold hover:underline">{t.addFirstItem}</button>
                   </div>
                 )}
               </div>
            </div>
          )}
        </form>
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <button type="submit" form="receipt-form" disabled={isSubmitting} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition active:scale-95">
          {isSubmitting ? t.saving : `💾 ${t.save}`}
        </button>
      </div>
    </div>
  );
};

export default ReceiptForm;