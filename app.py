from flask import Flask, render_template
from database.queries import get_data_by_year

app = Flask(__name__)

@app.route("/")
def home():
    data = get_data_by_year(2024)
    return render_template("index.html", data=data)

@app.route("/about")
def about():
    return render_template("about.html")

if __name__ == "__main__":
    app.run(debug=True)