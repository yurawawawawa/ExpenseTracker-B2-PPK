export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return '';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
}
