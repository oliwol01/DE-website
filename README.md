# EU Energy & Emissions Explorer

This website aims to explore the relationship between nuclear electricity production and carbon emissions across EU countries between 2016-2024. Website has interactive visualizations, country trend analysis, and energy-related insights from publicly available datasets:

https://ourworldindata.org/grapher/co-emissions-per-capita?tab=table&time=2007..2024
https://ec.europa.eu/eurostat/databrowser/view/nrg_bal_peh__custom_21039157/default/table


---

## Client-Side Components

The client side was developed using:

- HTML
- CSS
- Bootstrap 5
- JavaScript
- Chart.js

The frontend is responsible for rendering the user interface, displaying the interactive SVG map and charts, handling user interactions, and dynamically updating visualizations.

---

## Server-Side Components

The server side was developed using:

- Python
- Flask
- SQLite

The backend handles routing, retrieves data from the SQLite database, processes API requests, and returns JSON responses used by the frontend visualizations.

---

## Client–Server Interaction

The frontend communicates with the Flask backend through API endpoints. When users interact with the website, JavaScript sends requests to the server, which retrieves relevant data from the SQLite database and returns it as JSON. The frontend then updates charts, tooltips, and country information dynamically without reloading the page.
