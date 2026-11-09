export function extractShippingFee(
  content: string,
): number | null {
  const pattern =
    /(?:^|[^\p{L}])(?:phí\s*ship|tiền\s*ship|ship)\s*[:：=-]?\s*(?:(?:\d+)\s*(?:chuyến|lượt)\s*[:：=-]?\s*)?(\d+(?:[.,]\d+)*)(?:\s*(k|nghìn|ngàn))?(?![\p{L}\d])/giu;

  const matches = [...content.matchAll(pattern)];

  if (matches.length === 0) return null;

  const match = matches[matches.length - 1];

  const rawAmount = match[1];
  const unit = match[2]?.toLowerCase();

  if (!rawAmount) return null;

  let amount: number;

  if (unit) {
    amount = Number(rawAmount.replace(",", ".")) * 1000;
  } else {
    amount = Number(rawAmount.replace(/[.,]/g, ""));

    if (amount > 0 && amount < 1000) {
      amount *= 1000;
    }
  }

  return Number.isFinite(amount) ? amount : null;
}