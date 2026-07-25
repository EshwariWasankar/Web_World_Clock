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

  const hourDeg = ((currentParts.hours % 12) / 12) * 360 + (currentParts.minutes / 60) * 30;
  const minuteDeg = (currentParts.minutes / 60) * 360;
  const secondDeg = (currentParts.seconds / 60) * 360;

  return (
    <div className={`app-shell ${theme}`}>
      <div className="dashboard">
        <header className="hero">
          <div>
            <h1>World Clock Dashboard</h1>
            <p>Live time orchestration with synchronized zones and smart alarms.</p>
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

        <div className="content-grid">
          <section className="panel clock-card">
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
          </section>

          <section className="panel">
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
          </section>
        </div>
      </div>
    </div>
  );
}
