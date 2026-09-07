export const WHATSAPP_NUMBER = "917420005600"; // Format without + or spaces

export function generateWhatsAppLink(message: string): string {
  const encodedMessage = encodeURIComponent(message);
  
  // Basic user agent check for mobile vs desktop
  let isMobile = false;
  if (typeof window !== "undefined") {
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  if (isMobile) {
    // Force open the native app on mobile
    return `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;
  } else {
    // Open WhatsApp Web on desktop
    return `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;
  }
}
