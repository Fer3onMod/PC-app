/**
 * Tafqeet - Convert numbers to written Arabic words
 * Example: 12890 => "إثنى عشر ألف وثمانمائة وتسعون جنيه"
 */

const ones = [
  '',
  'واحد',
  'اثنان',
  'ثلاثة',
  'أربعة',
  'خمسة',
  'ستة',
  'سبعة',
  'ثمانية',
  'تسعة',
  'عشرة',
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر'
];

const tens = [
  '',
  '',
  'عشرون',
  'ثلاثون',
  'أربعون',
  'خمسون',
  'ستون',
  'سبعون',
  'ثمانون',
  'تسعون'
];

const hundreds = [
  '',
  'مائة',
  'مائتان',
  'ثلاثمائة',
  'أربعمائة',
  'خمسمائة',
  'ستمائة',
  'سبعمائة',
  'ثمانمائة',
  'تسعمائة'
];

function convertGroup(num: number): string {
  let groupText = '';

  const h = Math.floor(num / 100);
  const remainder = num % 100;

  if (h > 0) {
    groupText += hundreds[h];
  }

  if (remainder > 0) {
    if (groupText !== '') {
      groupText += ' و';
    }

    if (remainder < 20) {
      groupText += ones[remainder];
    } else {
      const o = remainder % 10;
      const t = Math.floor(remainder / 10);

      if (o > 0) {
        groupText += ones[o] + ' و' + tens[t];
      } else {
        groupText += tens[t];
      }
    }
  }

  return groupText;
}

export function tafqeet(numberInput: number, currency: string = 'جنيه'): string {
  if (numberInput === 0) {
    return `صفر ${currency}`;
  }

  const num = Math.abs(numberInput);
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) {
    return `صفر ${currency}`;
  }

  const parts: string[] = [];

  // Billions
  const billions = Math.floor(integerPart / 1000000000);
  if (billions > 0) {
    if (billions === 1) parts.push('مليار');
    else if (billions === 2) parts.push('ملياران');
    else if (billions >= 3 && billions <= 10) parts.push(`${convertGroup(billions)} مليارات`);
    else parts.push(`${convertGroup(billions)} مليار`);
  }

  // Millions
  const millions = Math.floor((integerPart % 1000000000) / 1000000);
  if (millions > 0) {
    if (millions === 1) parts.push('مليون');
    else if (millions === 2) parts.push('مليونان');
    else if (millions >= 3 && millions <= 10) parts.push(`${convertGroup(millions)} ملايين`);
    else parts.push(`${convertGroup(millions)} مليون`);
  }

  // Thousands
  const thousands = Math.floor((integerPart % 1000000) / 1000);
  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('ألف');
    } else if (thousands === 2) {
      parts.push('ألفان');
    } else if (thousands >= 3 && thousands <= 10) {
      parts.push(`${convertGroup(thousands)} آلاف`);
    } else if (thousands === 12) {
      parts.push('إثنى عشر ألف');
    } else {
      parts.push(`${convertGroup(thousands)} ألف`);
    }
  }

  // Remainder under 1000
  const remainder = integerPart % 1000;
  if (remainder > 0) {
    parts.push(convertGroup(remainder));
  }

  let result = parts.join(' و');

  // Polish specific common phrasing like "إثنى عشر ألف"
  result = result.replace(/^اثنا عشر ألف/, 'إثنى عشر ألف');
  result = result.replace(/ اثنا عشر ألف/, ' إثنى عشر ألف');

  result = `${result} ${currency}`;

  if (decimalPart > 0) {
    const decimalWords = convertGroup(decimalPart);
    result += ` و${decimalWords} قرشاً`;
  }

  return result.trim();
}
