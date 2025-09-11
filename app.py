import os
import sys
import uuid
import random
import string
import zipfile
import threading
import webbrowser
import pandas as pd
from flask import Flask, request, render_template, send_file, jsonify, after_this_request

# Fonction pour gérer les chemins corrects avec PyInstaller
def resource_path(relative_path):
    """Retourne le chemin correct pour PyInstaller ou script Python normal"""
    try:
        base_path = sys._MEIPASS  # dossier temporaire créé par PyInstaller
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

# Configuration de Flask
app = Flask(
    __name__,
    template_folder=resource_path("templates"),
    static_folder=resource_path("static")
)

# Dossiers pour les fichiers uploadés et traités
base_dir = os.path.dirname(sys.executable) if getattr(sys, 'frozen', False) else os.path.dirname(os.path.abspath(__file__))
app.config['UPLOAD_FOLDER'] = os.path.join(base_dir, 'uploads')
app.config['PROCESSED_FOLDER'] = os.path.join(base_dir, 'processed')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['PROCESSED_FOLDER'], exist_ok=True)

# Routes Flask
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if file.filename.lower() != 'personnes_100.csv':
            return jsonify({'error': 'Veuillez télécharger un fichier nommé « personnes_100.csv » uniquement.'}), 400

        session_id = str(uuid.uuid4())
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], f'{session_id}_{file.filename}')
        file.save(upload_path)
        process_files(upload_path, session_id)
        os.remove(upload_path)

        return jsonify({'success': True, 'session_id': session_id, 'message': 'Files processed successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download/<session_id>')
def download_files(session_id):
    try:
        zip_path = os.path.join(app.config['PROCESSED_FOLDER'], f'{session_id}_files.zip')
        files_to_zip = [
            os.path.join(app.config['PROCESSED_FOLDER'], f'{session_id}_personnes_100_salaire.csv'),
            os.path.join(app.config['PROCESSED_FOLDER'], f'{session_id}_regroupement_par_salaire.csv'),
            os.path.join(app.config['PROCESSED_FOLDER'], f'{session_id}_regroupement_par_salaire.xlsx')
        ]
        if not all(os.path.exists(f) for f in files_to_zip):
            return jsonify({'error': 'Files not found'}), 404

        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for file in files_to_zip:
                clean_name = "_".join(os.path.basename(file).split('_')[1:])
                zipf.write(file, clean_name)

        @after_this_request
        def remove_file(response):
            try:
                os.remove(zip_path)
                for file in files_to_zip:
                    if os.path.exists(file):
                        os.remove(file)
            except Exception as error:
                app.logger.error("Error removing files", error)
            return response

        return send_file(zip_path, as_attachment=True, download_name='salary_reports.zip')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Fonctions de traitement
def generate_immatriculation():
    letters = ''.join(random.choices(string.ascii_uppercase, k=3))
    numbers = ''.join(random.choices(string.digits, k=4))
    return f"{letters}{numbers}"

def process_files(file_path, session_id):
    df = pd.read_csv(file_path)
    df["Salaire"] = df["Nombre de jours"] * 3
    df = df[(df["Nombre de jours"] >= 0) & (df["Nombre de jours"] <= 27)]
    df = df.sort_values(by="Salaire")
    df["Immatriculation"] = df.apply(lambda x: generate_immatriculation(), axis=1)

    df.to_csv(os.path.join(app.config['PROCESSED_FOLDER'], f'{session_id}_personnes_100_salaire.csv'), index=False, encoding="utf-8")
    generate_grouped_csv(df, os.path.join(app.config['PROCESSED_FOLDER'], f'{session_id}_regroupement_par_salaire.csv'))
    generate_excel_file(df, os.path.join(app.config['PROCESSED_FOLDER'], f'{session_id}_regroupement_par_salaire.xlsx'))

def generate_grouped_csv(df, output_path):
    output_rows = []
    group_number = 1
    for salaire, group in df.groupby("Salaire"):
        nombre_personnes = len(group)
        nombre_jours = group["Nombre de jours"].iloc[0]
        output_rows.append([f"GROUPE {group_number} - Salaire: {salaire}DT"])
        output_rows.append([f"Nombre de personnes: {nombre_personnes}"])
        output_rows.append([f"Nombre de jours: {nombre_jours}"])
        output_rows.append([])
        output_rows.append(["Nom","Prénom","Immatriculation","ID Groupe","Salaire (DT)","Jours travaillés"])
        for _, row in group.iterrows():
            output_rows.append([row["Nom"], row["Prénom"], row["Immatriculation"], f"G{group_number}", salaire, nombre_jours])
        output_rows.append([])
        output_rows.append(["="*50])
        output_rows.append([])
        group_number += 1
    pd.DataFrame(output_rows).to_csv(output_path, index=False, header=False, encoding="utf-8")

def generate_excel_file(df, output_path):
    excel_data = []
    group_number = 1
    for salaire, group in df.groupby("Salaire"):
        nombre_personnes = len(group)
        nombre_jours = group["Nombre de jours"].iloc[0]
        excel_data.append({"A": f"GROUPE {group_number} - Salaire: {salaire}DT"})
        excel_data.append({"A": f"Nombre de personnes: {nombre_personnes}"})
        excel_data.append({"A": f"Nombre de jours: {nombre_jours}"})
        excel_data.append({})
        excel_data.append({"A":"Nom","B":"Prénom","C":"Immatriculation","D":"ID Groupe","E":"Salaire (DT)","F":"Jours"})
        for _, row in group.iterrows():
            excel_data.append({"A": row["Nom"],"B": row["Prénom"],"C": row["Immatriculation"],"D": f"G{group_number}","E": salaire,"F": nombre_jours})
        excel_data.append({})
        group_number += 1
    pd.DataFrame(excel_data).to_excel(output_path, index=False, engine='openpyxl')

# Ouvrir le navigateur automatiquement
def open_browser():
    webbrowser.open_new("http://127.0.0.1:5000")

if __name__ == '__main__':
    print("Démarrage du serveur Flask...")
    # Toujours ouvrir le navigateur après 1 seconde
    threading.Timer(1, open_browser).start()
    app.run(debug=False, host='127.0.0.1', port=5000)
