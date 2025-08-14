    function updateDateTime() {
      const now = new Date();
      const date = (now.getMonth()+1).toString().padStart(2, '0') + '/' +
                   now.getDate().toString().padStart(2, '0') + '/' +
                   now.getFullYear();
      const time = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
      document.getElementById('date').textContent = date;
      document.getElementById('time').textContent = time;
    }
    updateDateTime();
    setInterval(updateDateTime, 1000);

async function loadNWSForecast() {
  const forecastContainer = document.getElementById('forecast');
  const lat = 38.2527;
  const lon = -85.7585;

  try {
    // Step 1: get forecast URL
    const pointRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
    const pointData = await pointRes.json();
    const forecastUrl = pointData.properties.forecast;

    // Step 2: fetch forecast
    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();
    const periods = forecastData.properties.periods;

    // Step 3: group by day
    const daysMap = {};
    periods.forEach(period => {
      const date = period.startTime.split('T')[0]; // YYYY-MM-DD
      if (!daysMap[date]) daysMap[date] = [];
      daysMap[date].push(period);
    });

    // Step 4: build up to 5 day cards
    forecastContainer.innerHTML = '';
    const dayDates = Object.keys(daysMap).slice(0,5); // next 5 days

    dayDates.forEach(date => {
      const dayPeriods = daysMap[date];

      // High/Low temps
      const highTemp = Math.max(...dayPeriods.map(p => p.temperature));
      const lowTemp = Math.min(...dayPeriods.map(p => p.temperature));

      // Precipitation chance: pick max from day + night
      const precip = Math.max(...dayPeriods.map(p => p.probabilityOfPrecipitation?.value || 0));

      // Day name
      const d = new Date(date);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Kentucky/Louisville' });

      // Build card
      const card = document.createElement('div');
      card.className = 'forecast-card';
      card.innerHTML = `
        <div class="day">${dayName}</div>
        <div class="temp">High: ${Math.round(highTemp)}° / Low: ${Math.round(lowTemp)}°</div>
        <div class="precip">Precip: ${precip}%</div>
      `;
      forecastContainer.appendChild(card);
    });

  } catch (err) {
    console.error("Error fetching NWS forecast:", err);
    forecastContainer.innerHTML = `<div class="forecast-card">Forecast unavailable</div>`;
  }
}

loadNWSForecast();
