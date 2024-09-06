# import sqlite3
# conn = sqlite3.connect('db.sqlite3')
# cursor = conn.cursor()

# # Fonction pour afficher le contenu d'une table
# def print_table_content(table_name, limit=10):
#     cursor.execute(f"SELECT * FROM {table_name} LIMIT {limit}")
#     rows = cursor.fetchall()
#     columns = [description[0] for description in cursor.description]
    
#     print(f"\nContenu de la table '{table_name}' :")
#     print("ID\t" + "\t".join(columns))
#     for row in rows:
#         print("\t".join(str(value) if value != None else 'NULL' for value in row))

# # Afficher les tables
# print("Tables dans la base de données :")
# for row in cursor.execute("SELECT name FROM sqlite_master WHERE type='table';"):
#     print(row[0])

# # Afficher le schéma de chaque table
# print("\nSchémas des tables :")
# for table in ["django_migrations", "auth_group", "auth_user"]:
#     cursor.execute(f"PRAGMA table_info({table});")
#     print(f"\n{table}:")
#     for row in cursor.fetchall():
#         print(f"{row[1]} {row[2]}")

# # Afficher le contenu de quelques tables
# tables_to_show = [
#     ("auth_user", "Utilisateurs"),
#     ("django_admin_log", "Logs administratifs"),
#     ("user_user", "Données personnalisées"),
# ]

# for table_name, table_description in tables_to_show:
#     print(f"\n\n{table_description}:")
#     print_table_content(table_name)

# conn.close()

import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Fonction pour afficher le contenu d'une table
def print_table_content(table_name, limit=10):
    try:
        cursor.execute(f"SELECT * FROM {table_name} LIMIT {limit}")
        rows = cursor.fetchall()
        if rows:
            columns = [description[0] for description in cursor.description]
            
            print(f"\nContenu de la table '{table_name}' :")
            print("ID\t" + "\t".join(columns))
            for row in rows:
                print("\t".join(str(value) if value != None else 'NULL' for value in row))
        else:
            print(f"\nLa table '{table_name}' est vide.")
    except sqlite3.OperationalError:
        print(f"\nLa table '{table_name}' n'existe pas.")

# Fonction pour afficher les choix de TextChoices
def print_text_choices(cursor, model_name):
    try:
        cursor.execute(f"PRAGMA table_info({model_name});")
        rows = cursor.fetchall()
        if rows:
            for row in rows:
                column_name = row[1]
                if isinstance(getattr(User._meta.fields_dict.get(column_name), 'choices'), models.TextChoices):
                    choices = getattr(User._meta.fields_dict.get(column_name), 'choices').values_list('value', 'label')
                    print(f"\nChamps TextChoices dans {column_name}:")
                    for choice_value, choice_label in choices:
                        print(f"{choice_value}\t{choice_label}")
        else:
            print(f"\nAucun champ TextChoices trouvé dans {model_name}.")
    except AttributeError:
        print(f"\nLe modèle {model_name} n'a pas été chargé correctement.")

# Afficher les tables
print("Tables dans la base de données :")
try:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    if tables:
        for table in tables:
            print(table[0])
    else:
        print("Aucune table trouvée.")
except sqlite3.OperationalError:
    print("Impossible de lister les tables.")

# Afficher le schéma de chaque table
print("\nSchémas des tables :")
try:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    if tables:
        for table in tables:
            table_name = table[0]
            cursor.execute(f"PRAGMA table_info({table_name});")
            print(f"\n{table_name}:")
            rows = cursor.fetchall()
            if rows:
                for row in rows:
                    print(f"{row[1]} {row[2]}")
            else:
                print(f"Aucune information sur {table_name}.")
    else:
        print("Aucune table trouvée.")
except sqlite3.OperationalError:
    print("Impossible de lister les schémas des tables.")

# Afficher le contenu et les choix de TextChoices du modèle User
print("\nContenu et choix de TextChoices du modèle User:")
try:
    cursor.execute("SELECT * FROM user_user LIMIT 10")
    rows = cursor.fetchall()
    if rows:
        columns = [description[0] for description in cursor.description]
        
        print("ID\t" + "\t".join(columns))
        for row in rows:
            print("\t".join(str(value) if value != None else 'NULL' for value in row))
    else:
        print("La table 'user_user' est vide.")
except sqlite3.OperationalError:
    print("'user_user' n'est pas une table valide.")

# Appeler la fonction spécifique pour les TextChoices
print_text_choices(cursor, 'user_user')

conn.close()
