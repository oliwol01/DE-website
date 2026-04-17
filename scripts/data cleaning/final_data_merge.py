import pandas as pd

co2 = pd.read_csv("data/co-emissions-per-capita.csv")

co2 = co2.rename(columns={
    "Entity": "country",
    "Year": "year",
    "CO₂ emissions per capita": "co2_per_capita"
})

co2 = co2[["country", "year", "co2_per_capita"]]

co2 = co2[(co2["year"] >= 2016) & (co2["year"] <= 2024)]

co2["country"] = co2["country"].replace({
    "Czech Republic": "Czechia"
})

energy = pd.read_csv("data/energy_data_eu.csv")

eu_countries = energy["country"].unique()
co2 = co2[co2["country"].isin(eu_countries)]

final_df = pd.merge(energy, co2, on=["country", "year"], how="inner")

final_df.to_csv("data/energy_emissions_eu.csv", index=False)

print(final_df.head())
print("Saved to data/final_energy_emissions_eu.csv")