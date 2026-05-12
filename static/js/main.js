document.addEventListener("DOMContentLoaded", function () {
  const countryDataMap = {};
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  let trendChart;

  // ─── Hero button ────────────────────────────────────────────────────────────

  const exploreBtn = document.getElementById("explore-btn");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", function () {
      gtag("event", "explore_data_clicked");
      document
        .getElementById("insights")
        .scrollIntoView({ behavior: "smooth" });
    });
  }

  // ─── Source link tracking ────────────────────────────────────────────────────

  document.querySelectorAll(".report-link").forEach((link) => {
    link.addEventListener("click", function () {
      gtag("event", "source_opened", { source: link.href });
    });
  });

  // ─── Map ─────────────────────────────────────────────────────────────────────

  function getCountryColor(share) {
    if (share >= 0.5) return "#8fd3ff";
    if (share >= 0.3) return "#53a9ea";
    if (share >= 0.1) return "#2d79c7";
    return "#20356b";
  }

  function addMapHoverEffects() {
    const svgPaths = document.querySelectorAll(".map-wrapper svg path");
    const tooltip = document.getElementById("map-tooltip");
    const wrapper = document.querySelector(".map-wrapper");

    function showTooltip(e, country) {
      tooltip.innerHTML = `
        <div class="fw-semibold mb-1">${country.country_name}</div>
        <div class="small text-white-50">Nuclear Share: ${(country.nuclear_share * 100).toFixed(1)}%</div>
        <div class="small text-white-50">CO₂ per capita: ${country.co2_per_capita.toFixed(1)} t</div>
      `;

      const rect = wrapper.getBoundingClientRect();
      let x = e.clientX - rect.left + 16;
      let y = e.clientY - rect.top + 16;

      if (x + tooltip.offsetWidth > rect.width)
        x = e.clientX - rect.left - tooltip.offsetWidth - 16;
      if (y + tooltip.offsetHeight > rect.height)
        y = e.clientY - rect.top - tooltip.offsetHeight - 16;

      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
      tooltip.style.opacity = "1";
    }

    function repositionTooltip(e) {
      const rect = wrapper.getBoundingClientRect();
      const tw = tooltip.offsetWidth;
      const th = tooltip.offsetHeight;

      let x = e.clientX - rect.left + 16;
      let y = e.clientY - rect.top + 16;

      if (x + tw > rect.width) x = e.clientX - rect.left - tw - 16;
      if (y + th > rect.height) y = e.clientY - rect.top - th - 16;

      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    }

    svgPaths.forEach((path) => {
      if (!isTouch) {
        path.addEventListener("mouseenter", function (e) {
          const country = countryDataMap[path.id];
          if (!country) return;
          path.style.opacity = "0.82";
          path.style.strokeWidth = "0.35";
          path.style.cursor = "pointer";
          showTooltip(e, country);
        });

        path.addEventListener("mousemove", repositionTooltip);

        path.addEventListener("mouseleave", function () {
          path.style.opacity = "1";
          path.style.strokeWidth = "0.1";
          tooltip.style.opacity = "0";
        });
      }

      if (isTouch) {
        path.addEventListener("click", function (e) {
          const country = countryDataMap[path.id];
          if (!country) return;

          if (
            tooltip.style.opacity === "1" &&
            tooltip.dataset.active === path.id
          ) {
            tooltip.style.opacity = "0";
            tooltip.dataset.active = "";
            return;
          }

          const point = e.changedTouches ? e.changedTouches[0] : e;
          showTooltip(point, country);
          tooltip.dataset.active = path.id;
          e.stopPropagation();
        });
      }
    });

    if (isTouch) {
      document.addEventListener("click", function () {
        tooltip.style.opacity = "0";
        tooltip.dataset.active = "";
      });
    }
  }

  async function loadMapData() {
    try {
      const response = await fetch("/api/map-data");
      const energyData = await response.json();

      energyData.forEach((country) => {
        countryDataMap[country.code] = country;
        const path = document.getElementById(country.code);
        if (path) path.style.fill = getCountryColor(country.nuclear_share);
      });

      addMapHoverEffects();
    } catch (error) {
      console.error("Failed to load map data:", error);
    }
  }

  // ─── Trend chart ─────────────────────────────────────────────────────────────

  function createTrendChart(labels, nuclearValues, emissionValues) {
    const chartCanvas = document.getElementById("country-trends-chart");
    if (!chartCanvas) return;
    if (trendChart) trendChart.destroy();

    trendChart = new Chart(chartCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Nuclear Share (%)",
            data: nuclearValues,
            borderColor: "#53a9ea",
            backgroundColor: "#53a9ea",
            borderWidth: 4,
            pointRadius: 0,
            tension: 0.35,
            fill: false,
            yAxisID: "y",
          },
          {
            label: "CO₂ per capita",
            data: emissionValues,
            borderColor: "rgba(180, 200, 255, 0.45)",
            backgroundColor: "rgba(180, 200, 255, 0.45)",
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.2,
            borderDash: [4, 6],
            fill: false,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "rgba(255,255,255,0.75)",
              usePointStyle: true,
              pointStyle: "line",
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: "rgba(6,12,30,0.95)",
            borderColor: "rgba(255,255,255,0.08)",
            borderWidth: 1,
            titleColor: "rgba(255,255,255,0.95)",
            bodyColor: "rgba(255,255,255,0.8)",
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.04)" },
            ticks: { color: "rgba(255,255,255,0.7)" },
            border: { color: "rgba(255,255,255,0.12)" },
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: "rgba(255,255,255,0.04)" },
            ticks: { color: "rgba(255,255,255,0.7)", callback: (v) => v + "%" },
            title: {
              display: true,
              text: "Nuclear Share",
              color: "rgba(255,255,255,0.7)",
            },
            border: { color: "rgba(255,255,255,0.12)" },
          },
          y1: {
            position: "right",
            grid: { drawOnChartArea: false },
            ticks: {
              color: "rgba(255,255,255,0.7)",
              callback: (v) => Number(v).toFixed(1) + " t",
            },
            title: {
              display: true,
              text: "CO₂ per capita",
              color: "rgba(255,255,255,0.7)",
            },
            border: { color: "rgba(255,255,255,0.12)" },
          },
        },
      },
    });
  }

  // ─── Country analysis ────────────────────────────────────────────────────────

  function co2Level(val) {
    if (val >= 10) return "very high";
    if (val >= 6) return "high";
    if (val >= 3) return "moderate";
    return "low";
  }

  function nuclearSentence(country, avgNuclear) {
    if (avgNuclear >= 0.5)
      return `${country} maintained a very high reliance on nuclear electricity throughout the observed period.`;
    if (avgNuclear >= 0.2)
      return `${country} sustained a moderate level of nuclear electricity production between 2016 and 2024.`;
    if (avgNuclear > 0)
      return `${country} relied only marginally on nuclear electricity production during the observed period.`;
    return `${country} did not produce nuclear electricity during the observed period.`;
  }

  function emissionSentence(firstEmission, lastEmission, willAddNegativeCross) {
    const level = co2Level(lastEmission);
    if (lastEmission < firstEmission - 0.5) {
      return willAddNegativeCross
        ? ` CO₂ emissions per capita edged down from ${firstEmission.toFixed(1)} t to ${lastEmission.toFixed(1)} t, but remain at a ${level} level.`
        : ` CO₂ emissions per capita declined from ${firstEmission.toFixed(1)} t to ${lastEmission.toFixed(1)} t - a ${level} level overall, but showing gradual progress toward lower-carbon energy.`;
    }
    if (lastEmission > firstEmission + 0.5) {
      return ` CO₂ emissions per capita rose from ${firstEmission.toFixed(1)} t to ${lastEmission.toFixed(1)} t, reaching a ${level} level and indicating continued dependence on carbon-intensive sources.`;
    }
    return ` CO₂ emissions per capita remained relatively stable at around ${lastEmission.toFixed(1)} t - a ${level} level.`;
  }

  function crossSentence(
    avgNuclear,
    avgEmission,
    lastEmission,
    emissionDrop,
    strongDowntrend,
  ) {
    if (avgNuclear === 0 && avgEmission >= 8 && !strongDowntrend)
      return " The absence of nuclear power combined with persistently high per-capita emissions suggests a strong ongoing dependence on fossil fuels.";
    if (avgNuclear === 0 && avgEmission >= 8 && strongDowntrend)
      return ` Despite no nuclear electricity, emissions have fallen sharply by ${emissionDrop.toFixed(1)} t - suggesting significant progress in decarbonising through other means, though the starting point was very high.`;
    if (avgNuclear === 0 && lastEmission < 3)
      return " Despite producing no nuclear electricity, the country achieves low per-capita emissions, likely through renewables or low overall energy demand.";
    if (avgNuclear >= 0.5 && lastEmission < 3)
      return " The high nuclear share correlates with notably low per-capita emissions, consistent with a largely decarbonised electricity mix.";
    if (avgNuclear >= 0.2 && lastEmission >= 6)
      return " Despite a meaningful nuclear share, per-capita emissions remain high, suggesting other sectors - transport, heating, or industry - are still heavily fossil-fuel dependent.";
    return "";
  }

  function generateCountryAnalysis(trendData) {
    if (!trendData.length) return "No analysis available for this country.";

    const country = trendData[0].country_name;
    const firstEmission = trendData[0].co2_per_capita;
    const lastEmission = trendData[trendData.length - 1].co2_per_capita;
    const avgNuclear =
      trendData.reduce((sum, r) => sum + r.nuclear_share, 0) / trendData.length;
    const avgEmission =
      trendData.reduce((sum, r) => sum + r.co2_per_capita, 0) /
      trendData.length;
    const emissionDrop = firstEmission - lastEmission;
    const strongDowntrend = emissionDrop > 2;
    const willAddNegativeCross =
      avgNuclear === 0 && avgEmission >= 8 && !strongDowntrend;

    return (
      nuclearSentence(country, avgNuclear) +
      emissionSentence(firstEmission, lastEmission, willAddNegativeCross) +
      crossSentence(
        avgNuclear,
        avgEmission,
        lastEmission,
        emissionDrop,
        strongDowntrend,
      )
    );
  }

  // ─── Country dropdown & trend data ──────────────────────────────────────────

  async function loadCountryDropdown() {
    try {
      const response = await fetch("/api/countries");
      const countries = await response.json();
      const select = document.getElementById("country-select");
      if (!select) return;

      select.innerHTML = "";
      countries.forEach((country) => {
        const option = document.createElement("option");
        option.value = country.code;
        option.textContent = country.country_name;
        select.appendChild(option);
      });

      select.addEventListener("change", async function () {
        gtag("event", "country_selected", { country: select.value });
        await loadCountryTrendData(select.value);
      });

      if (countries.length > 0) await loadCountryTrendData(countries[0].code);
    } catch (error) {
      console.error("Failed to load countries:", error);
    }
  }

  async function loadCountryTrendData(countryCode) {
    try {
      const response = await fetch(`/api/country-trends/${countryCode}`);
      const trendData = await response.json();

      const labels = trendData.map((row) => row.year);
      const nuclearValues = trendData.map((row) =>
        Math.round(row.nuclear_share * 100),
      );
      const emissionValues = trendData.map((row) =>
        Number(row.co2_per_capita.toFixed(1)),
      );

      createTrendChart(labels, nuclearValues, emissionValues);

      const analysisElement = document.getElementById("country-analysis");
      if (analysisElement) {
        analysisElement.textContent = generateCountryAnalysis(trendData);
      }
    } catch (error) {
      console.error("Failed to load country trends:", error);
    }
  }

  // ─── Init ────────────────────────────────────────────────────────────────────

  loadCountryDropdown();
  loadMapData();
});
