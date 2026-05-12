from database.db import get_db_connection
from contextlib import contextmanager

# ─── Connection helper ────────────────────────────────────────────────────────

@contextmanager
def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_latest_year():
    with get_db() as conn:
        return conn.execute("SELECT MAX(year) FROM Energy_Emission_data").fetchone()[0]

# ─── Queries ──────────────────────────────────────────────────────────────────

def get_data_by_year(year):
    with get_db() as conn:
        return conn.execute("""
            SELECT c.country_name, c.code, e.year, e.nuclear_share, e.co2_per_capita
            FROM Energy_Emission_data e
            JOIN Countries c ON e.country_id = c.country_id
            WHERE e.year = ?
            ORDER BY e.nuclear_share DESC
        """, (year,)).fetchall()


def get_highest_nuclear_share():
    with get_db() as conn:
        return conn.execute("""
            SELECT c.country_name, e.nuclear_share
            FROM Energy_Emission_data e
            JOIN Countries c ON e.country_id = c.country_id
            WHERE e.year = (SELECT MAX(year) FROM Energy_Emission_data)
            ORDER BY e.nuclear_share DESC
            LIMIT 1
        """).fetchone()


def get_lowest_emission_nuclear_country():
    with get_db() as conn:
        return conn.execute("""
            SELECT c.country_name, e.co2_per_capita
            FROM Energy_Emission_data e
            JOIN Countries c ON e.country_id = c.country_id
            WHERE e.year = (SELECT MAX(year) FROM Energy_Emission_data)
            AND e.nuclear_share > 0
            ORDER BY e.co2_per_capita ASC
            LIMIT 1
        """).fetchone()


def get_eu_average_nuclear_share():
    with get_db() as conn:
        return conn.execute("""
            SELECT AVG(nuclear_share)
            FROM Energy_Emission_data
            WHERE year = (SELECT MAX(year) FROM Energy_Emission_data)
        """).fetchone()[0]


def get_highest_emission_without_nuclear():
    with get_db() as conn:
        return conn.execute("""
            SELECT c.country_name, e.co2_per_capita
            FROM Energy_Emission_data e
            JOIN Countries c ON e.country_id = c.country_id
            WHERE e.year = (SELECT MAX(year) FROM Energy_Emission_data)
            AND e.nuclear_share = 0
            ORDER BY e.co2_per_capita DESC
            LIMIT 1
        """).fetchone()


def get_country_trends(country_code):
    with get_db() as conn:
        return conn.execute("""
            SELECT e.year, e.nuclear_share, e.co2_per_capita, c.country_name, c.code
            FROM Energy_Emission_data e
            JOIN Countries c ON e.country_id = c.country_id
            WHERE c.code = ?
            ORDER BY e.year ASC
        """, (country_code,)).fetchall()


def get_all_countries():
    with get_db() as conn:
        return conn.execute("""
            SELECT country_name, code
            FROM Countries
            ORDER BY country_name ASC
        """).fetchall()