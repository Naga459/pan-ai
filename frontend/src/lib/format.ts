const timeFormat = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export function formatTime(timestamp: number): string {
  return timeFormat.format(timestamp).toUpperCase()
}

function startOfDay(timestamp: number): number {
  const d = new Date(timestamp)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** "Today, 10:24 AM" · "Yesterday, 3:18 PM" · "24 Apr 2025" */
export function formatRelativeDate(timestamp: number, now = Date.now()): string {
  const days = Math.round((startOfDay(now) - startOfDay(timestamp)) / 86_400_000)
  if (days === 0) return `Today, ${formatTime(timestamp)}`
  if (days === 1) return `Yesterday, ${formatTime(timestamp)}`
  return dateFormat.format(timestamp)
}
