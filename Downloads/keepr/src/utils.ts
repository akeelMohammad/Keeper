import TextRecognition from '@react-native-ml-kit/text-recognition';
import { KNOWN_BRANDS } from './types';

export const getAddedLabel = (sourceType: 'ocr' | 'manual'): string => {
  const timestamp = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  return sourceType === 'ocr' ? `Scanned on ${timestamp}` : `Manual Entry • ${timestamp}`;
};

export const evaluateStatus = (expiryDateStr?: string, alertDays: number = 30): string => {
  if (!expiryDateStr) return 'ACTIVE';
  const normalized = expiryDateStr.replace(/[\/\.-]/g, '-');
  const expiry = new Date(normalized);
  if (isNaN(expiry.getTime())) return 'ACTIVE';

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'EXPIRED';
  } else if (diffDays <= alertDays) {
    return 'EXPIRING';
  } else {
    return 'ACTIVE';
  }
};

export const performOnDeviceMLKitOCR = async (photoUri: string): Promise<{
  name: string;
  brand: string;
  price: number;
  purchaseDate: string;
  expiryDate: string;
}> => {
  let name = '';
  let brand = '';
  let price = 0;
  let purchaseDate = '';
  let expiryDate = '';

  try {
    const result = await TextRecognition.recognize(photoUri);
    const rawTextBlocks = result.blocks.map(block => block.text);
    const fullText = rawTextBlocks.join('\n').toUpperCase();
    const inlineText = rawTextBlocks.join(' ').toUpperCase();

    for (const b of KNOWN_BRANDS) {
      if (fullText.includes(b)) {
        brand = b.charAt(0) + b.slice(1).toLowerCase();
        break;
      }
    }

    const priceRegex = /(?:TOTAL|AMOUNT|SUBTOTAL|PRICE)\s*[:=]?\s*[\$]?\s*(\d+(?:\.\d{2})?)/i;
    const priceMatch = inlineText.match(priceRegex);
    if (priceMatch && priceMatch[1]) {
      price = parseFloat(priceMatch[1]);
    } else {
      const allPrices = inlineText.match(/\b\d{1,4}\.\d{2}\b/g);
      if (allPrices && allPrices.length > 0) {
        price = Math.max(...allPrices.map(p => parseFloat(p)));
      }
    }

    const dateRegex = /\b(\d{4}[\/\.-]\d{2}[\/\.-]\d{2}|\d{2}[\/\.-]\d{2}[\/\.-]\d{2,4})\b/g;
    const dateMatches = inlineText.match(dateRegex);
    if (dateMatches && dateMatches.length > 0) {
      purchaseDate = dateMatches[0];
      if (dateMatches.length > 1) {
        expiryDate = dateMatches[1];
      }
    }

    if (brand) {
      const nameLine = rawTextBlocks.find(line => 
        line.toUpperCase().includes(brand.toUpperCase()) && 
        line.length > brand.length
      );
      if (nameLine) name = nameLine.trim();
    }
  } catch (error) {
    console.error("ML Kit Recognition Failed: ", error);
  }

  return { name, brand, price, purchaseDate, expiryDate };
};