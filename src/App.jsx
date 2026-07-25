import { useEffect, useMemo, useState } from 'react';
import { formatDate, formatTime, getTimeParts, shouldTriggerAlarm } from './clockUtils';

const timezones = [
  { label: 'New York', value: 'America/New_York' },
  { label: 'London', value: 'Europe/London' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
  { label: 'Sydney', value: 'Australia/Sydney' },
  { label: 'Dubai', value: 'Asia/Dubai' },
  { label: 'India (IST)', value: 'Asia/Kolkata' },
  { label: 'UTC', value: 'UTC' },
];

const initialAlarms = [
  { id: 1, label: 'Morning Sync', time: '09:00', timezone: 'UTC' },
  { id: 2, label: 'Launch Review', time: '15:30', timezone: 'Europe/London' },
];

const globeMarkers = [
  { value: 'America/New_York', label: 'New York', x: 95, y: 115 },
  { value: 'Europe/London', label: 'London', x: 208, y: 96 },
  { value: 'Asia/Kolkata', label: 'IST', x: 296, y: 112 },
  { value: 'Asia/Tokyo', label: 'Tokyo', x: 346, y: 97 },
  { value: 'Australia/Sydney', label: 'Sydney', x: 362, y: 152 },
];

const widgetOrderInitial = ['clock', 'globe', 'zones', 'alarms'];

export default function App() {
  const [date, setDate] = useState(new Date());
  const [selectedZone, setSelectedZone] = useState('America/New_York');
  const [theme, setTheme] = useState('dark');
  const [showSeconds, setShowSeconds] = useState(true);
  const [use24Hour, setUse24Hour] = useState(true);
  const [alarms, setAlarms] = useState(initialAlarms);
  const [alarmHour, setAlarmHour] = useState('09');
  const [alarmMinute, setAlarmMinute] = useState('00');
  const [activeAlarmId, setActiveAlarmId] = useState(null);
  const [widgetOrder, setWidgetOrder] = useState(widgetOrderInitial);
  const [draggedWidgetId, setDraggedWidgetId] = useState(null);

  useEffect(() => {
    const interval = window.setInterval(() => setDate(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeAlarmId) return;
    const currentAlarm = alarms.find((alarm) => alarm.id === activeAlarmId);
    if (!currentAlarm) return;
    if (shouldTriggerAlarm(currentAlarm, date, currentAlarm.timezone)) {
      window.alert(`Alarm triggered: ${currentAlarm.label}`);
      setActiveAlarmId(null);
    }
  }, [activeAlarmId, alarms, date]);

  const currentParts = useMemo(() => getTimeParts(date, selectedZone), [date, selectedZone]);
  const selectedLabel = useMemo(() => timezones.find((zone) => zone.value === selectedZone)?.label ?? 'Custom', [selectedZone]);

  const addAlarm = (event) => {
    event?.preventDefault();
    const normalized = `${alarmHour.padStart(2, '0')}:${alarmMinute.padStart(2, '0')}`;
    setAlarms((existing) => [
      ...existing,
      { id: Date.now(), label: 'Custom Alarm', time: normalized, timezone: selectedZone },
    ]);
  };

  const removeAlarm = (id) => {
    setAlarms((existing) => existing.filter((alarm) => alarm.id !== id));
    if (activeAlarmId === id) setActiveAlarmId(null);
  };

  const enableAlarm = (alarm) => {
    setActiveAlarmId(alarm.id);
  };

  const toggleTheme = () => {
    setTheme((previous) => (previous === 'dark' ? 'light' : 'dark'));
  };

  const reorderWidgets = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    setWidgetOrder((previous) => {
      const next = [...previous];
      const fromIndex = next.indexOf(fromId);
      const toIndex = next.indexOf(toId);
      if (fromIndex === -1 || toIndex === -1) return previous;
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const hourDeg = ((currentParts.hours % 12) / 12) * 360 + (currentParts.minutes / 60) * 30;
  const minuteDeg = (currentParts.minutes / 60) * 360;
  const secondDeg = (currentParts.seconds / 60) * 360;

  const renderWidget = (widgetId) => {
    if (widgetId === 'clock') {
      return (
        <div className="clock-card">
          <div className="analog-wrap" aria-label="analog clock">
            <div className="hand hour" style={{ transform: `rotate(${hourDeg}deg)` }} />
            <div className="hand minute" style={{ transform: `rotate(${minuteDeg}deg)` }} />
            <div className="hand second" style={{ transform: `rotate(${secondDeg}deg)` }} />
            <div className="center-dot" />
          </div>
          <div className="digital-time">{formatTime(date, selectedZone, showSeconds, use24Hour)}</div>
          <div className="digital-date">{formatDate(date, selectedZone)}</div>
          <div className="status-row">
            <span className="badge">{selectedLabel}</span>
            <span className="badge">Live sync • {showSeconds ? 'seconds visible' : 'seconds hidden'}</span>
          </div>
        </div>
      );
    }

      if (widgetId === 'globe') {
      return (
        <div className="globe-card">
          <svg viewBox="0 0 400 220" className="world-map" role="img" aria-label="interactive world map">
            <rect x="0" y="0" width="400" height="220" rx="24" fill="transparent" />
            <g fill="#27455b" stroke="none" transform="translate(0,6)">
              <path d="M40 80c8-18 28-30 50-28 18 2 32 12 44 26 12 14 18 32 18 50-2 20-12 36-28 44-20 10-42 6-62-8-16-12-28-32-28-52 0-10 4-22 8-32z" />
              <path d="M160 62c22-12 46-14 70-6 20 7 38 20 52 40 14 16 22 36 20 58-4 28-22 50-46 60-28 12-60 6-82-16-16-16-24-38-22-62 2-18 10-34 18-78z" />
              <path d="M300 118c8-6 18-8 28-6 10 3 18 10 22 20 4 8 6 18 4 28-2 12-8 22-18 28-10 6-22 6-32 0-8-6-14-16-16-28-2-10 0-18 2-22z" />
            </g>
          </svg>
          <div className="globe-markers">
            {globeMarkers.map((marker) => (
              <button
                key={marker.value}
                type="button"
                className={`globe-marker ${selectedZone === marker.value ? 'active' : ''}`}
                style={{ left: `${marker.x}px`, top: `${marker.y}px` }}
                onClick={() => setSelectedZone(marker.value)}
                aria-label={`Jump to ${marker.label}`}
              >
                <span>{marker.label}</span>
              </button>
            ))}
          </div>
          <p className="widget-help">Click a marker to jump to that region.</p>
        </div>
      );
    }

    if (widgetId === 'zones') {
      return (
        <div className="zone-list">
          {timezones.map((zone) => (
            <div className="zone-card" key={zone.value}>
              <div>
                <strong>{zone.label}</strong>
                <span>{formatTime(date, zone.value, true, use24Hour)}</span>
              </div>
              <span>{formatDate(date, zone.value)}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div>
        <form className="control-row" style={{ marginBottom: 16, alignItems: 'center' }} onSubmit={addAlarm}>
          <div className="time-picker">
            <select value={alarmHour} onChange={(event) => setAlarmHour(event.target.value)}>
              {Array.from({ length: 24 }, (_, index) => index).map((hour) => (
                <option key={hour} value={String(hour).padStart(2, '0')}>
                  {String(hour).padStart(2, '0')}
                </option>
              ))}
            </select>
            <span>:</span>
            <select value={alarmMinute} onChange={(event) => setAlarmMinute(event.target.value)}>
              {Array.from({ length: 60 }, (_, index) => index).map((minute) => (
                <option key={minute} value={String(minute).padStart(2, '0')}>
                  {String(minute).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Add Alarm</button>
        </form>
        <div className="alarm-list">
          {alarms.map((alarm) => (
            <div className="alarm-item" key={alarm.id}>
              <div>
                <strong>{alarm.label}</strong>
                <div>{alarm.time} • {alarm.timezone}</div>
              </div>
              <div className="control-row">
                <button type="button" onClick={() => enableAlarm(alarm)}>Arm</button>
                <button type="button" onClick={() => removeAlarm(alarm.id)} style={{ background: '#556' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`app-shell ${theme}`}>
      <div className="dashboard">
        <header className="hero">
          <div>
            <h1>World Clock Dashboard</h1>
            <p>Live time orchestration with synchronized zones, an interactive globe, and smart alarms.</p>
          </div>
          <div className="control-row">
            <select value={selectedZone} onChange={(event) => setSelectedZone(event.target.value)}>
              {timezones.map((zone) => (
                <option key={zone.value} value={zone.value}>{zone.label}</option>
              ))}
            </select>
            <button type="button" onClick={() => setShowSeconds((previous) => !previous)}>Seconds {showSeconds ? 'On' : 'Off'}</button>
            <button type="button" onClick={() => setUse24Hour((previous) => !previous)}>{use24Hour ? '12h' : '24h'}</button>
            <button type="button" onClick={toggleTheme}>Theme</button>
          </div>
        </header>

        <div className="widgets-grid">
          {widgetOrder.map((widgetId) => {
            const widgetTitles = {
              clock: 'Live Clock',
              globe: 'Interactive Globe',
              zones: 'World Time List',
              alarms: 'Alarm Center',
            };
            const widgetDescriptions = {
              clock: 'Analog and digital display',
              globe: 'Tap to focus a world region',
              zones: 'Track multiple global cities',
              alarms: 'Create and monitor alarms',
            };

            return (
              <section
                key={widgetId}
                className={`panel widget-card ${draggedWidgetId === widgetId ? 'dragging' : ''}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  reorderWidgets(draggedWidgetId, widgetId);
                  setDraggedWidgetId(null);
                }}
              >
                <div
                  className="widget-header"
                  draggable
                  onDragStart={() => setDraggedWidgetId(widgetId)}
                  onDragEnd={() => setDraggedWidgetId(null)}
                >
                  <div>
                    <strong>{widgetTitles[widgetId]}</strong>
                    <span>{widgetDescriptions[widgetId]}</span>
                  </div>
                  <span className="drag-handle">⋮⋮</span>
                </div>
                <div className="widget-body">{renderWidget(widgetId)}</div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
