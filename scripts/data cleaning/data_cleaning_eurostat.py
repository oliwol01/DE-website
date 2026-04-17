import pandas as pd

nuclear = pd.read_excel("data/electricity_nuclear.xlsx", skiprows=9)
total = pd.read_excel("data/electricity_total.xlsx", skiprows=9)

#remove empty cols
nuclear = nuclear.loc[:, ~nuclear.columns.str.contains("^Unnamed")]
total = total.loc[:, ~total.columns.str.contains("^Unnamed")]

# renaming first col
nuclear = nuclear.rename(columns={"TIME": "country"})
total = total.rename(columns={"TIME": "country"})

nuclear = nuclear[nuclear["country"] != "GEO (Labels)"]
total = total[total["country"] != "GEO (Labels)"]

# useful columns
nuclear = nuclear[["country", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"]]
total = total[["country", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"]]

nuclear_long = nuclear.melt(id_vars=["country"], var_name="year", value_name="nuclear")
total_long = total.melt(id_vars=["country"], var_name="year", value_name="total")

for df, col in [(nuclear_long, "nuclear"), (total_long, "total")]:
    df[col] = (
        df[col]
        .astype(str)
        .str.replace(",", "", regex=False)
        .str.replace(" ", "", regex=False)
        .replace(":", pd.NA)
    )
    df[col] = pd.to_numeric(df[col], errors="coerce")

# merge total with nuclear
merged = pd.merge(nuclear_long, total_long, on=["country", "year"])

merged["nuclear_share"] = merged["nuclear"] / merged["total"]

merged = merged.dropna(subset=["nuclear", "total"])

merged.to_csv("data/energy_data_eu.csv", index=False)

print(merged.head())
print("Saved to data/energy_data_eu.csv")