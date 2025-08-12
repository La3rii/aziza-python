import pandas as pd

# Read the CSV with semicolon separator
df = pd.read_csv("personnes_100.csv", sep=';')

# Calculate the salary
df["Salaire"] = df["Nombre de jours"] * 3000

# Save the updated CSV with semicolon separator
df.to_csv("personnes_100_salaire.csv", index=False, sep=';')
print("✅ Fichier 'personnes_100_salaire.csv' généré.")

# Create sorted grouping
grouped_details = df[["Salaire", "Nom", "Prénom"]].sort_values(by="Salaire")

# Save grouped details CSV with semicolon separator
grouped_details.to_csv("regroupement_par_salaire_details.csv", index=False, sep=';')
print("✅ Fichier 'regroupement_par_salaire_details.csv' généré.")
