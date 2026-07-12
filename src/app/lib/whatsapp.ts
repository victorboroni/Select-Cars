// Todo CTA de contato aponta para o WhatsApp — sem formulário de captação/CRM.
export const WHATSAPP_NUMBER = "5511000000000"; // +55 11 0000-0000 (mock)

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const GENERIC_MESSAGE =
  "Olá, gostaria de falar com um curador da SELECTCARS.";

export function vehicleMessage(brand: string, model: string) {
  return `Olá, gostaria de saber mais sobre o ${brand} ${model}`;
}
