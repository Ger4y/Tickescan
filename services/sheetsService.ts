import { ReceiptData, GoogleFormConfig } from "../types";

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

  // Construct the form data (application/x-www-form-urlencoded)
  const formData = new URLSearchParams();
  formData.append(config.mapping.date, data.date);
  formData.append(config.mapping.establishment, data.establishment);
  formData.append(config.mapping.amount, data.amount);
  formData.append(config.mapping.payer, data.payer);

  // Google Forms response handling workaround:
  // Google Forms returns a redirect or HTML that CORS blocks.
  // However, with mode: 'no-cors', the request is SENT successfully, 
  // but we get an "opaque" response (we can't read the status code).
  // We assume success if fetch doesn't throw a network error.
  
  try {
    // Ensure we are posting to formResponse, not viewform
    const submitUrl = config.formUrl.replace(/viewform.*/, 'formResponse');

    await fetch(submitUrl, {
      method: 'POST',
      mode: 'no-cors', // Essential for Google Forms
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    // Since 'no-cors' hides 4xx/5xx errors, we rely on the promise resolving 
    // to assume network success. Logic errors (like validation) won't be caught here,
    // so we advise users to disable "Required" fields in their form initially.

  } catch (error) {
    console.error("Form Submission Error:", error);
    throw new Error("Error de conexión al enviar el formulario.");
  }
};