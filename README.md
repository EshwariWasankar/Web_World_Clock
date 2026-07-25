# World Clock Dashboard

A React-based real-time world clock dashboard with:
- Analog and digital clocks
- Multiple timezone support including India (IST)
- Theme switching
- Seconds visibility toggle
- 12-hour and 24-hour time format switching
- Alarm creation using a digital time-picker interface
- Docker support

## Project Structure

- src/App.jsx - main dashboard UI, state management, clock updates, timezone selection, and alarm logic
- src/clockUtils.js - shared helpers for formatting time and date values
- src/clockUtils.test.js - tests for the formatting and alarm utility logic
- src/styles.css - styling for the dashboard, panels, time-picker controls, and themes
- Dockerfile - container definition for running the app
- docker-compose.yml - Docker Compose setup

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

## Run with Docker

Make sure Docker Desktop is running.

Build and start the container:

```bash
docker compose up --build
```

Then open:

```text
http://localhost:5173/
```

## Build for Production

```bash
npm run build
```

## Run Tests

```bash
npm test
```

