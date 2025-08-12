from flask import Flask, request, send_file, render_template_string, redirect, url_for, session
import pandas as pd
import os

app = Flask(__name__)
app.secret_key = "your_secret_key_here"  # Required for session

UPLOAD_HTML = """
<!doctype html>
<title>Upload CSV</title>
<style>
  body {
    font-family: Arial, sans-serif;
    background: #f4f7f8;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
  }
  form {
    background: white;
    padding: 30px 40px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    max-width: 400px;
    width: 100%;
    text-align: center;
  }
  h2 {
    margin-bottom: 20px;
    color: #2c3e50;
  }
  input[type="file"] {
    margin-bottom: 20px;
    width: 100%;
  }
  input[type="submit"] {
    background-color: #3498db;
    border: none;
    color: white;
    padding: 12px 20px;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    width: 100%;
  }
  input[type="submit"]:hover {
    background-color: #2980b9;
  }
  p.error {
    color: red;
  }
</style>

<h2>Upload votre fichier personnes_100.csv</h2>
<form method=post enctype=multipart/form-data>
  <input type=file name=file required>
  <input type=submit value=Upload>
</form>
{% if message %}
  <p class="error"><strong>{{ message }}</strong></p>
{% endif %}
"""

DOWNLOAD_HTML = """
<!doctype html>
<title>Téléchargement des fichiers</title>
<style>
  body {
    font-family: Arial, sans-serif;
    background: #f4f7f8;
    color: #333;
    padding: 40px;
    max-width: 600px;
    margin: auto;
  }
  h2 {
    color: #2c3e50;
  }
  ul {
    list-style-type: none;
    padding-left: 0;
  }
  ul li {
    margin: 12px 0;
  }
  ul li a {
    color: #3498db;
    text-decoration: none;
    font-weight: bold;
  }
  ul li a:hover {
    text-decoration: underline;
  }
  a.back-link {
    display: inline-block;
    margin-top: 20px;
    color: #666;
    text-decoration: none;
  }
  a.back-link:hover {
    text-decoration: underline;
  }
</style>

<h2>Fichiers générés avec succès !</h2>
<p>Téléchargez vos fichiers :</p>
<ul>
  {% for file, link in download_links.items() %}
    <li><a href="{{ link }}">{{ file }}</a></li>
  {% endfor %}
</ul>
<a href="{{ url_for('upload_file') }}" class="back-link">&larr; Retour à la page d'upload</a>
"""

@app.route("/", methods=["GET", "POST"])
def upload_file():
    if request.method == "POST":
        file = request.files.get("file")
        if file and file.filename.endswith(".csv"):
            input_path = "personnes_100.csv"
            file.save(input_path)
            
            df = pd.read_csv(input_path, sep=';')
            df["Salaire"] = df["Nombre de jours"] * 3000
            
            output1 = "personnes_100_salaire.csv"
            output2 = "regroupement_par_salaire_details.csv"
            
            df.to_csv(output1, index=False, sep=';')
            grouped_details = df[["Salaire", "Nom", "Prénom"]].sort_values(by="Salaire")
            grouped_details.to_csv(output2, index=False, sep=';')
            
            # Save filenames in session for next page
            session["download_links"] = {
                output1: url_for("download_file", filename=output1),
                output2: url_for("download_file", filename=output2)
            }
            
            return redirect(url_for("download_files"))
        else:
            return render_template_string(UPLOAD_HTML, message="Veuillez télécharger un fichier CSV valide.")
    return render_template_string(UPLOAD_HTML, message=None)

@app.route("/download_files")
def download_files():
    download_links = session.get("download_links")
    if not download_links:
        # No files to download, redirect to upload
        return redirect(url_for("upload_file"))
    return render_template_string(DOWNLOAD_HTML, download_links=download_links)

@app.route("/download/<filename>")
def download_file(filename):
    if os.path.exists(filename):
        return send_file(filename, as_attachment=True)
    else:
        return "Fichier non trouvé.", 404

if __name__ == "__main__":
    app.run(debug=True)
