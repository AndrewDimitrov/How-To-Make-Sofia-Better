let map; // Declare map in the global scope

document.addEventListener("DOMContentLoaded", function () {
  // Declare Variables
  const input = document.getElementById("cityInput");
  let aqiLevel;

  // Initialize the map in the global scope
  const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const OSM_ATTRIB =
    '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const osmLayer = L.tileLayer(OSM_URL, { attribution: OSM_ATTRIB });

  const WAQI_URL =
    "https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=_TOKEN_ID_";
  const WAQI_ATTR = "Air Quality Tiles &copy; aqicn";
  const waqiLayer = L.tileLayer(WAQI_URL, { attribution: WAQI_ATTR });

  map = L.map("map").setView([42.6977, 23.3219], 11); // Expose map globally
  map.addLayer(osmLayer).addLayer(waqiLayer);

  // When page loads call fetchAirQuality with value(argument) Sofia.
  window.addEventListener("load", () => fetchAirQuality("Sofia"));

  // Call fetchAirQuality on icon click
  document.getElementById("searchIcon").addEventListener("click", callApi);

  // Call Api with argument - input value
  function callApi() {
    let inputValue = input.value;
    fetchAirQuality(inputValue);
  }

  // Call fetchAirQuality when "Enter" is pressed, with value(argument) of input value
  input.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      callApi();
    }
  });

  function fetchAirQuality(city) {
    document.getElementById("loader").classList.remove("hidden"); // Add animation when loading
    document.getElementById("loadedContent").classList.add("hidden"); // Hide content of previous search
    document.getElementById("cityAqiContainer").innerText = ""; // Remove text for incorrect searches(when displaying errors)

    fetch(`/api/airQuality?city=${city}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      // If response is ok, display the data
      .then((data) => {
        console.log("Parsed JSON data:", data);

        const pollutantsArr = ["PM25", "PM10", "O3", "NO2", "SO2"]; // Table elements id's
        let biggestPollutant = 0;
        let biggestPollutantName;
        let openedData = 0; // How many pollutants are shown

        document.getElementById("cityName").innerText = `${
          city.charAt(0).toUpperCase() + city.slice(1)
        }`; // Capitalize first letter of the searched city

        aqiLevel = data.data.aqi; // Searched city AQI level
        document.getElementById("airPollutionIndex").innerText = `${getAqiLevel(
          aqiLevel
        )}`; // Display what level air quality is (eg. Good, Moderate etc.)
        document.getElementById("airPollutionAqi").innerText = `${aqiLevel}`; // Display Air quality index in numbers

        // Find the biggest pollutant
        for (let i = 0; i < pollutantsArr.length; i++) {
          const pollutantData = data.data.iaqi[pollutantsArr[i].toLowerCase()];
          if (pollutantData !== undefined) {
            if (pollutantData.v > biggestPollutant) {
              biggestPollutant = pollutantData.v;
              biggestPollutantName = pollutantsArr[i];
            }
          }
        }

        if (biggestPollutantName === "PM25") biggestPollutantName = "PM2.5";
        document.getElementById("mainPolutant").innerText =
          biggestPollutantName;

        // Data handling code
        for (let i = 0; i < pollutantsArr.length; i++) {
          const pollutantData = data.data.iaqi[pollutantsArr[i].toLowerCase()];
          const row = document.getElementById(`${pollutantsArr[i]}Holder`);

          if (pollutantData === undefined) {
            row.classList.add("hidden"); // Hide row if no data
          } else {
            openedData += 1;
            row.classList.remove("hidden"); // Show row if data exists
            document.getElementById(pollutantsArr[i]).innerText =
              pollutantData.v;
            setColorBasedOnValue(pollutantsArr[i], pollutantData.v); // Apply background-color to pollutantdepending on it's value
          }
        }

        function applyRowColors() {
          const rows = Array.from(
            document.querySelectorAll("#tableStatisticsPollutants .tableRow")
          ); // All rows
          let visibleRowIndex = 0; // Used to check which rows should have darker background

          rows.forEach((row) => {
            if (!row.classList.contains("hidden")) {
              row.classList.remove("oddRow", "evenRow"); // Remove existing classes
              const newClass = visibleRowIndex % 2 === 0 ? "oddRow" : "evenRow"; // Check if the current row is odd
              row.classList.add(newClass); // Add correct class
              visibleRowIndex++;
            }
          });
        }
        applyRowColors(); // Apply row colors based on visible rows

        // If there is not information for pollutants hide table
        if (openedData === 0) {
          document.getElementById("tableStatistics").classList.add("hidden");
        } else {
          document.getElementById("tableStatistics").classList.remove("hidden");
        }

        map.panTo([data.data.city.geo[0], data.data.city.geo[1]], 12); // Go to the searched location
      })
      // If response is not ok dispay error
      .catch(() => {
        document.getElementById("cityAqiContainer").innerText =
          localStorage.getItem("language") === "bg"
            ? `Няма данни за ${city}.`
            : `Could not find air quality data for ${city}.`;
        document.addEventListener("languageChanged", () =>
          languageErrorChanged()
        ); // Change language
        function languageErrorChanged() {
          // If content is hidden
          if (
            document
              .getElementById("loadedContent")
              .classList.contains("hidden")
          ) {
            document.getElementById("cityAqiContainer").innerText =
              localStorage.getItem("language") === "bg"
                ? `Няма данни за ${city}.`
                : `Could not find air quality data for ${city}.`;
          }
        }
      })
      // After the fetch has finished hide loader
      .finally(function () {
        // If there is no error show "loadedContent"
        if (
          !cityAqiContainer.innerText.includes(
            "Could not find air quality data for"
          ) &&
          !cityAqiContainer.innerText.includes("Няма данни за")
        ) {
          document.getElementById("loadedContent").classList.remove("hidden");
        }
        document.getElementById("loader").classList.add("hidden");
      });
  }

  // Display Aqi level text in the corresponding language
  function getAqiLevel(aqi) {
    const language = localStorage.getItem("language");
    if (aqi <= 50) return language === "bg" ? "Добро" : "Good";
    if (aqi <= 100) return language === "bg" ? "Умерено" : "Moderate";
    if (aqi <= 150)
      return language === "bg"
        ? "	Нездравословно за Чувствителни Групи"
        : "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return language === "bg" ? "Нездравословно" : "Unhealthy";
    if (aqi <= 300)
      return language === "bg" ? "Много Нездравословно" : "Very Unhealthy";
    if (aqi > 300) return language === "bg" ? "Опасно" : "Hazardous";
  }

  // Listen for "languageChanged" to change placeholder and "getAqiLevel" text
  document.addEventListener("languageChanged", () => languageChanged());
  function languageChanged() {
    input.placeholder =
      localStorage.getItem("language") === "bg"
        ? "Потърсете за град..."
        : "Search for a city..."; // Update placeholder text
    document.getElementById("airPollutionIndex").innerText =
      getAqiLevel(aqiLevel); // Update AQI level in the current language
  }

  // Determine AQI level
  function setColorBasedOnValue(pollutant, value) {
    const element = document.getElementById(`${pollutant}Range`);
    const backgroundElement = document.getElementById(
      `${pollutant}RangeBackground`
    );
    const activeRangeLength = document.getElementById(`${pollutant}Range`);
    const color = "";
    const backgroundColor = "";

    // Clear previous color classes
    element.classList.remove(
      "greenQuality",
      "yellowQuality",
      "orangeQuality",
      "redQuality",
      "purpleQuality",
      "maroonQuality"
    );
    backgroundElement.classList.remove(
      "greenQualityBackground",
      "yellowQualityBackground",
      "orangeQualityBackground",
      "redQualityBackground",
      "purpleQualityBackground",
      "maroonQualityBackground"
    );

    // Add new color classes
    if (value <= 50) {
      element.classList.add("greenQuality");
      backgroundElement.classList.add("greenQualityBackground");
    } else if (value <= 100) {
      element.classList.add("yellowQuality");
      backgroundElement.classList.add("yellowQualityBackground");
    } else if (value <= 150) {
      element.classList.add("orangeQuality");
      backgroundElement.classList.add("orangeQualityBackground");
    } else if (value <= 200) {
      element.classList.add("redQuality");
      backgroundElement.classList.add("redQualityBackground");
    } else if (value <= 300) {
      element.classList.add("purpleQuality");
      backgroundElement.classList.add("purpleQualityBackground");
    } else {
      element.classList.add("maroonQuality");
      backgroundElement.classList.add("maroonQualityBackground");
    }

    // Calculate range
    const maxInputValue = 100;
    const maxLength = 100;
    const length =
      ((Math.sqrt(value) / Math.sqrt(maxInputValue)) * maxLength) / 1.8;
    activeRangeLength.style.width = `${length}%`;

    // Apply the final styles
    element.style.backgroundColor = color;
    backgroundElement.style.backgroundColor = backgroundColor;
  }

  // Add Popup and overlay and disable scrolling
  document
    .getElementById("airPollutionIndexHolder")
    .addEventListener("click", aqiRecommendations);
  function aqiRecommendations() {
    document.getElementById("popUpTableAqi").classList.remove("hidden");
    document.getElementById("aqiContainer").classList.remove("hidden");
    document.querySelector("body").classList.add("bodyNoScroll");
  }

  // Close Popup and overlay and enable scrolling
  document
    .getElementById("popUpTableAqi")
    .addEventListener("click", aqiRecommendationsClose);
  function aqiRecommendationsClose() {
    document.getElementById("popUpTableAqi").classList.add("hidden");
    document.getElementById("aqiContainer").classList.add("hidden");
    document.querySelector("body").classList.remove("bodyNoScroll");
  }
});
