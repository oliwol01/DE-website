from database.db import get_db_connection

def get_data_by_year(year):
    conn = get_db_connection()
    rows = conn.execute("""
        SELECT c.country_name, e.year, e.nuclear_share, e.co2_per_capita
        FROM Energy_Emission_data e
        JOIN Countries c ON e.country_id = c.country_id
        WHERE e.year = ?
        ORDER BY e.nuclear_share DESC
    """, (year,)).fetchall()
    conn.close()
    return rows