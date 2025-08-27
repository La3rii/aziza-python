# 💼 Salary Report Generator

Une application Python (Flask) qui permet de **générer des rapports de salaires** à partir de fichiers CSV.  
Elle fournit une interface web simple pour charger des données, calculer les salaires et télécharger des rapports formatés.

---

## 🚀 Fonctionnalités

- 📂 **Upload de fichier CSV** contenant les informations des employés.  
- 🧾 **Calcul automatique des salaires** (salaire brut, déductions, net).  
- 📊 **Affichage des résultats** dans une table interactive.  
- 📑 **Export des rapports** (Excel, SCV, ZIP, etc.).  
- 🌐 **Interface Web avec Flask**.  

---

## 📦 Installation

### 1️⃣ Cloner le dépôt
```bash
git clone https://github.com/La3rii/aziza-python.git
cd aziza-python/salary-report-app

python -m venv venv
source venv/bin/activate   # Sur Linux/Mac
venv\Scripts\activate      # Sur Windows

Installer les dépendances:
pip install -r requirements.txt

pyinstaller --onefile --add-data "templates;templates" --add-data "static;static" app.py

Lancer l’application:
python app.py
