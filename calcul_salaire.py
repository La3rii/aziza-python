import pandas as pd

df = pd.read_csv("personnes_100.csv")

df["Salaire"] = df["Nombre d'heures"] * 3000

df.to_csv("personnes_100_salaire.csv", index=False)
print("✅ Fichier 'personnes_100_salaire.csv' généré.")

grouped_details = df[["Salaire", "Nom", "Prénom"]].sort_values(by="Salaire")

grouped_details.to_csv("regroupement_par_salaire_details.csv", index=False)
print("✅ Fichier 'regroupement_par_salaire_details.csv' généré.")
