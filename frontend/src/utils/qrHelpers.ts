/**
 * QR Helpers
 * 
 * Utility functions for QR code generation and validation.
 * 
 * @module QRHelpers
 */

/**
 * Generate a QR code payload for ticket validation
 * @param orderId - The order ID
 * @param attendeeName - The attendee's name
 * @param secretKey - The HMAC secret key
 * @returns QR code payload string
 */
export const generateQRPayload = (
  orderId: string,
  attendeeName: string,
  secretKey: string
): string => {
  // Create data string
  const data = `${orderId}|${attendeeName}`
  
  // Generate HMAC signature (simulated - in production use crypto)
  // This is a placeholder - actual implementation should use Web Crypto API
  const signature = generateMockSignature(data, secretKey)
  
  // Return full payload
  return `${orderId}|${attendeeName}|${signature}`
}

/**
 * Generate a mock signature for QR code (placeholder)
 * In production, use crypto.subtle for HMAC-SHA256
 */
const generateMockSignature = (data: string, secretKey: string): string => {
  // This is a simplified mock - production should use proper HMAC
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

/**
 * Validate a QR code payload
 * @param payload - The scanned QR payload
 * @param secretKey - The HMAC secret key
 * @returns Parsed order ID and attendee name if valid
 */
export const validateQRPayload = (
  payload: string,
  secretKey: string
): { isValid: boolean; orderId?: string; attendeeName?: string; error?: string } => {
  const parts = payload.split('|')
  
  if (parts.length !== 3) {
    return { isValid: false, error: 'Invalid QR code format' }
  }
  
  const [orderId, attendeeName, providedSignature] = parts
  
  // Recompute signature
  const data = `${orderId}|${attendeeName}`
  const expectedSignature = generateMockSignature(data, secretKey)
  
  if (providedSignature !== expectedSignature) {
    return { isValid: false, error: 'Invalid QR code signature' }
  }
  
  return { isValid: true, orderId, attendeeName }
}

/**
 * Download QR code as PNG image
 * @param canvasElement - The canvas element containing the QR code
 * @param filename - Desired filename
 */
export const downloadQRCode = (canvasElement: HTMLCanvasElement, filename: string): void => {
  const pngUrl = canvasElement.toDataURL('image/png')
  const downloadLink = document.createElement('a')
  downloadLink.href = pngUrl
  downloadLink.download = filename
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
}

/**
 * Generate a ticket filename for download
 * @param eventTitle - The event title
 * @param attendeeName - The attendee name
 * @returns Formatted filename
 */
export const generateTicketFilename = (eventTitle: string, attendeeName: string): string => {
  const sanitizedEvent = eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const sanitizedName = attendeeName.replace(/\s/g, '_').toLowerCase()
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  return `${sanitizedEvent}_${sanitizedName}_${timestamp}.png`
}

/**
 * Get QR code data URL from order ID
 * @param orderId - The order ID
 * @returns QR code data URL
 */
export const getQRCodeDataUrl = (orderId: string): string => {
  return `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/qr-code`
}

/**
 * Share QR code via native share API
 * @param qrCodeUrl - The QR code image URL
 * @param title - Share title
 * @param text - Share text
 */
export const shareQRCode = async (
  qrCodeUrl: string,
  title: string,
  text: string
): Promise<boolean> => {
  if (!navigator.share) {
    return false
  }
  
  try {
    await navigator.share({
      title,
      text,
      url: qrCodeUrl,
    })
    return true
  } catch (error) {
    console.error('Share failed:', error)
    return false
  }
}