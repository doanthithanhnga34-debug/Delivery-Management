


export function generateOrderCode(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `SHIP-${randomNum}`;
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}