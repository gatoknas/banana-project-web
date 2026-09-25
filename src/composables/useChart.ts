export const RETRO_PALETTE = [
  '#1a6b52', // Emerald
  '#c0392b', // Crimson
  '#d4a017', // Golden Title
  '#2b6cb0', // Vintage Blue
  '#dd6b20', // Warm Coral
  '#319795', // Teal
  '#702459', // Wine
  '#805ad5', // Vintage Purple
  '#38a169', // Leaf Green
  '#4a5568'  // Retro Slate
];

export function formatCOP(val: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(val || 0);
}

export function formatCompactCOP(val: number): string {
  if (val >= 1000000) {
    return `$${(val / 1000000).toFixed(1)}M`;
  }
  if (val >= 1000) {
    return `$${(val / 1000).toFixed(0)}k`;
  }
  return formatCOP(val);
}

export function useRetroChartTheme() {
  const baseTooltip = {
    backgroundColor: '#fffcf6',
    borderColor: '#2d3748',
    borderWidth: 2,
    textStyle: {
      color: '#1a202c',
      fontFamily: 'Outfit, sans-serif',
      fontSize: 13,
      fontWeight: '500'
    },
    extraCssText: 'box-shadow: 4px 4px 0px 0px #2d3748; border-radius: 8px;'
  };

  const baseGrid = {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '12%',
    containLabel: true
  };

  return {
    palette: RETRO_PALETTE,
    baseTooltip,
    baseGrid,
    formatCOP,
    formatCompactCOP
  };
}
