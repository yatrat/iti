const DATA_URL = "https://cdn.jsdelivr.net/gh/yatrat/iti@v1/itinerary.json";

let allData = {};

fetch(DATA_URL)
  .then(res => res.json())
  .then(data => {
    allData = data.cities || {};
  });

const app = document.getElementById("app");
const cityInput = document.getElementById("cityInput");
const daysInput = document.getElementById("daysInput");
const suggestionBox = document.getElementById("citySuggestions");

cityInput.addEventListener("input", () => {
  if (!allData || Object.keys(allData).length === 0) return;

  const query = cityInput.value.toLowerCase();
  suggestionBox.innerHTML = "";

  if (query.length < 1) return;

  Object.values(allData).forEach(city => {
    if (city.name.toLowerCase().includes(query)) {
      const div = document.createElement("div");
      div.innerText = city.name;
      div.onclick = () => selectCity(city);
      suggestionBox.appendChild(div);
    }
  });
});

function selectCity(city) {
  cityInput.value = city.name;
  suggestionBox.innerHTML = "";
  render(city);
}

daysInput.addEventListener("input", () => {
  const city = getSelectedCity();
  if (city) render(city);
});

function getSelectedCity() {
  const name = cityInput.value.toLowerCase();
  return Object.values(allData).find(c => c.name.toLowerCase() === name);
}

function render(city) {
  clearPrevious();

  let days = parseInt(daysInput.value);
  if (isNaN(days) || days < 1) days = 1;
  if (days > 5) days = 5;

  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `<div class="city">${city.name}</div><div class="region">${city.region} India</div>`;
  app.appendChild(header);

  city.days.slice(0, days).forEach(day => {
    const div = document.createElement("div");
    div.className = "day";

    let html = `<h3>Day ${day.day}: ${day.theme}</h3><ul>`;
    day.activities.forEach(act => {
      html += `<li>${act.name} <span class="muted">(${act.duration} hrs)</span></li>`;
    });
    html += "</ul>";

    div.innerHTML = html;
    app.appendChild(div);
  });

  if (days === 5) {
    renderDay5Message();
  }

  const foodTitle = document.createElement("h2");
  foodTitle.textContent = "Food Recommendations";
  app.appendChild(foodTitle);

  city.food_recommendations.forEach(f => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `${f.name} — ${f.place} <span class="muted">(${formatRange(f.cost)})</span>`;
    app.appendChild(div);
  });

  const stayTitle = document.createElement("h2");
  stayTitle.textContent = "Stay Options";
  app.appendChild(stayTitle);

  Object.entries(city.stay).forEach(([type, list]) => {
    list.forEach(hotel => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `${hotel.name} (${type}) — ${formatPrice(hotel.price)}`;
      app.appendChild(div);
    });
  });

  if (city.emergency) {
    const div = document.createElement("div");
    div.className = "emergency";
    div.innerHTML = `<strong>Emergency Contacts</strong><br>Police: ${city.emergency.police}<br>Ambulance: ${city.emergency.ambulance}`;
    app.appendChild(div);
  }

  const legal = document.createElement("p");
  legal.className = "legal";
  legal.textContent = "This itinerary is a general guide. Prices, availability, and timings may vary.";
  app.appendChild(legal);
}

function clearPrevious() {
  Array.from(app.children).forEach(child => {
    if (
      child !== cityInput &&
      child !== daysInput &&
      child !== suggestionBox &&
      child.tagName !== "LABEL"
    ) {
      app.removeChild(child);
    }
  });
}

function formatPrice(price) {
  return price === null ? "View current price" : `₹${price}`;
}

function formatRange(cost) {
  const min = Math.round(cost * 0.8);
  const max = Math.round(cost * 1.2);
  return `₹${min}–${max}`;
}

function renderDay5Message() {
  const div = document.createElement("div");
  div.className = "day5";
  div.innerHTML = `
    <h3>Make the Most of Your Last Day!</h3>
    <p>Choose from these universal options:</p>
    <ul>
      <li><strong>Cultural Connection</strong> — Local life experiences</li>
      <li><strong>Scenic Discovery</strong> — Beautiful spots exploration</li>
      <li><strong>Food Journey</strong> — Authentic taste experiences</li>
      <li><strong>Relaxation Time</strong> — Leisurely pace enjoyment</li>
      <li><strong>Shopping & Souvenirs</strong> — Meaningful mementos</li>
      <li><strong>Personal Interest</strong> — Your specific hobby or interest</li>
    </ul>
  `;
  app.appendChild(div);
}
