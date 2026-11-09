export interface FormatOptions {
  /** Text after the amount. Default 'FCFA'. Use 'XAF' for the ISO code, '' for none. */
  label?: string;
  /** Thousands separator. Default U+202F (narrow no-break space). */
  separator?: string;
}

export interface ToWordsOptions {
  /** Append "franc(s) CFA". Default true. */
  currency?: boolean;
  /** 'traditionnelle' (default) or '1990' (hyphens between all numerals). */
  orthographe?: 'traditionnelle' | '1990';
}

function assertAmount(amount: unknown, fn: string): asserts amount is number {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    throw new TypeError(`money.${fn} expects a finite number`);
  }
  if (!Number.isSafeInteger(amount)) {
    throw new RangeError(`money.${fn} expects an integer amount: the CFA franc has no subunit`);
  }
}

/** money.format(125000) === '125 000 FCFA' (with non-breaking spaces) */
export function format(amount: number, options: FormatOptions = {}): string {
  assertAmount(amount, 'format');
  const { label = 'FCFA', separator = ' ' } = options;
  const sign = amount < 0 ? '-' : '';
  const grouped = Math.abs(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return label ? `${sign}${grouped} ${label}` : `${sign}${grouped}`;
}


/**
 * Parse a formatted CFA amount into an integer.
 * Supports thousands separators: spaces, dots and commas.
 * Supports currency labels: FCFA, F CFA, CFA, F, XAF and francs.
 */
export function parse(value: string): number {
  if (typeof value !== 'string') {
    throw new TypeError('money.parse expects a string');
  }

  const input = value.trim();

  if (!input) {
    throw new TypeError('money.parse expects a non-empty string');
  }

  // Remove an optional currency label only at the end.
const currencyPattern = /(?:FCFA|F\s*CFA|CFA|XAF|francs?|F)$/i;

const cleaned = input.replace(currencyPattern, '').trim();

  // Extract the optional negative sign.
  const sign = cleaned.startsWith('-') ? '-' : '';
  const unsigned = cleaned.replace(/^-/, '');

  if (!unsigned) {
    throw new TypeError('money.parse received an invalid amount');
  }

  // Determine the thousands separator.
  const separators = unsigned.match(/[.,\s\u00A0\u202F]/g) ?? [];
  const uniqueSeparators = [...new Set(separators)];

  if (uniqueSeparators.length > 1) {
    throw new TypeError('money.parse received mixed separators');
  }

  const separator = uniqueSeparators[0];

  let digits = unsigned;
  if (separator) {
  const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const groupingPattern = new RegExp(
    `^\\d{1,3}(?:${escapedSeparator}\\d{3})+$`
  );

  if (!groupingPattern.test(unsigned)) {
    throw new TypeError('money.parse received an invalid amount format');
  }

  digits = unsigned.replace(/[.,\s\u00A0\u202F]/g, '');
  } else if (!/^\d+$/.test(unsigned)) {
  throw new TypeError('money.parse received an invalid amount');
 }
  
  const result = Number(`${sign}${digits}`);

  if (!Number.isSafeInteger(result)) {
    throw new RangeError('money.parse expects a safe integer amount');
  }

  return result;
 }

/**
 * Amount in words: toWords(125000) === 'cent vingt-cinq mille francs CFA'.
 * Specified by fixtures/money/to-words.json. Not implemented yet: see the open issue.
 */
export function toWords(amount: number, _options: ToWordsOptions = {}): string {
  assertAmount(amount, 'toWords');
  throw new Error('money.toWords is not implemented yet. Contributions welcome: see fixtures/money/to-words.json');
}
