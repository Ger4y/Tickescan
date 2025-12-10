import { ReceiptData, GoogleFormConfig } from "./types";

export const saveToSheets = async (data: ReceiptData, configStr: string): Promise<void> => {
  if (!configStr) {
    throw new Error("Falta configuración.");
  }

  let config: GoogleFormConfig;
  try {
    config = JSON.parse(configStr);
  } catch (e) {
    throw new Error("Configuración inválida. Por favor reconfigura en ajustes.");
  }

  if (!config.formUrl || !config.mapping) {
    throw new Error("Configuración incompleta.");
  }

  const formData = new URLSearchParams();
  formData.append(config.mapping.date, data.date);
  formData.append(config.mapping.establishment, data.establishment);
  formData.append(config.mapping.amount, data.amount);
  formData.append(config.mapping.payer, data.payer);
  
  try {
    const submitUrl = config.formUrl.replace(/viewform.*/, 'formResponse');
    await fetch(submitUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
  } catch (error) {
    console.error("Form Submission Error:", error);
    throw new Error("Error de conexión al enviar el formulario.");
  }
};