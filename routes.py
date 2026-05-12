from flask import render_template, jsonify

from database.queries import (
    get_data_by_year,
    get_highest_nuclear_share,
    get_lowest_emission_nuclear_country,
    get_eu_average_nuclear_share,
    get_highest_emission_without_nuclear,
    get_country_trends,
    get_all_countries,
)

# ─── Page Routes ─────────────────────────────

def init_routes(app):

    @app.route("/")
    def home():

        data = get_data_by_year(2024)

        highest_nuclear = get_highest_nuclear_share()
        lowest_emission_nuclear = get_lowest_emission_nuclear_country()
        eu_average = get_eu_average_nuclear_share()
        highest_emission_no_nuclear = get_highest_emission_without_nuclear()

        insights = [
            {
                "label": "Highest Nuclear Share",
                "value": f"{round(highest_nuclear['nuclear_share'] * 100)}%",
                "text": f"{highest_nuclear['country_name']} leads Europe in nuclear electricity share."
            },

            {
                "label": "Lowest CO₂ with Nuclear",
                "value": f"{round(lowest_emission_nuclear['co2_per_capita'], 1)}",
                "text": f"{lowest_emission_nuclear['country_name']} has the lowest emissions among nuclear countries."
            },

            {
                "label": "EU Nuclear Average",
                "value": f"{round(eu_average * 100)}%",
                "text": "Average nuclear contribution across analyzed EU countries."
            },

            {
                "label": "Highest CO₂ without Nuclear",
                "value": f"{round(highest_emission_no_nuclear['co2_per_capita'], 1)}",
                "text": f"{highest_emission_no_nuclear['country_name']} records the highest emissions without nuclear energy."
            }

        ]

        return render_template(
            "index.html",
            data=data,
            insights=insights,
        )
    
# ─── API Routes ──────────────────────────────

    @app.route("/api/map-data")
    def map_data():

        data = get_data_by_year(2024)

        return jsonify([
            dict(row)
            for row in data
        ])

    @app.route("/api/countries")
    def countries():

        countries = get_all_countries()

        return jsonify([
            dict(country)
            for country in countries
        ])

    @app.route("/api/country-trends/<country_code>")
    def country_trends(country_code):

        trends = get_country_trends(country_code)

        return jsonify([
            dict(row)
            for row in trends
        ])