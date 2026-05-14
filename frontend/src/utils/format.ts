/**
 * 将元转换为万元或亿元的可读字符串
 * 例：50000000 → "5,000.00 万"，4780000000 → "47.80 亿"
 */
export function formatAmount(yuan: number): string {
  if (yuan >= 1e8) {
    return `${(yuan / 1e8).toFixed(2)} 亿`
  }
  return `${(yuan / 1e4).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 万`
}

/**
 * 将小数收益率转换为带符号的百分比字符串
 * 例：0.3725 → "+37.25%"，-0.05 → "-5.00%"
 */
export function formatPercent(rate: number): string {
  const pct = (rate * 100).toFixed(2)
  return rate >= 0 ? `+${pct}%` : `${pct}%`
}

/**
 * 格式化净值，保留 4 位小数
 * 例：1.4823 → "1.4823"
 */
export function formatNav(nav: number): string {
  return nav.toFixed(4)
}

/**
 * 格式化日期，直接返回 YYYY-MM-DD 字符串
 */
export function formatDate(date: string): string {
  return date.slice(0, 10)
}
