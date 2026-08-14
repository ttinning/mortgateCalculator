const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

const currencyFormatterPrecise = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 2,
})

export function formatCurrency(value, { precise = false } = {}) {
  const number = Number.isFinite(value) ? value : 0
  return precise ? currencyFormatterPrecise.format(number) : currencyFormatter.format(number)
}

export function formatMonthsAsYearsMonths(totalMonths) {
  const months = Math.max(0, Math.round(totalMonths))
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (years === 0) return `${remainingMonths} mo`
  if (remainingMonths === 0) return `${years} yr`
  return `${years} yr ${remainingMonths} mo`
}
