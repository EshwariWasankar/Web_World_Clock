export function formatTime(date, timeZone, includeSeconds = false, use24Hour = true) {
  const formatter = new Intl.DateTimeFormat(use24Hour ? 'en-GB' : 'en-US', {
    hour: use24Hour ? '2-digit' : 'numeric',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: !use24Hour,
    timeZone,
  });
  return formatter.format(date);
}

export function formatDate(date, timeZone) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone,
  }).format(date);
}

export function getTimeParts(date, timeZone) {
  const time = new Date(date.toLocaleString('en-US', { timeZone }));
  return {
    hours: time.getHours(),
    minutes: time.getMinutes(),
    seconds: time.getSeconds(),
  };
}

export function shouldTriggerAlarm(alarm, currentDate, timeZone) {
  const current = formatTime(currentDate, timeZone, false, true);
  return current.startsWith(alarm.time);
}
