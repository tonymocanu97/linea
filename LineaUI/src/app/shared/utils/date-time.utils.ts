export function getTargetTime(timezoneOffset: number): Date {
  const now = new Date();

  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;

  return new Date(utcTime + timezoneOffset * 3600000);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
