
export function extractShippingFee(
  content: string,
): string | null {
  const pattern =
    /(?:^|[^\p{L}])(?:phí\s*ship|tiền\s*ship|ship)\s*[:：=-]?\s*(\d+(?:[.,]\d+)*)(?:\s*(k|nghìn|ngàn))?(?![\p{L}\d])/giu;

  const matches = [...content.matchAll(pattern)];

  if (matches.length === 0) {
    return null;
  }
  const lastMatch = matches[matches.length - 1];

  const amount = lastMatch[1];
  const unit = lastMatch[2];

  return unit ? `${amount} ${unit}` : amount;
}