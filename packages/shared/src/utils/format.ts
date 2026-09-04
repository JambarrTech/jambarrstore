export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`;
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} k`;
  return String(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}
