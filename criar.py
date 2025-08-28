import sqlite3
import csv

def criar_banco(db_name='airbnb.db', csv_file='listings.csv'):
    """
    Cria um banco de dados SQLite normalizado a partir de um arquivo CSV do Airbnb.
    """
    # Conecta ao banco de dados (cria o arquivo se não existir)
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # --- CRIAÇÃO DAS TABELAS ---
    # Usamos 'IF NOT EXISTS' para o script poder ser executado várias vezes sem erro.

    # Tabela para os anfitriões (Hosts)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Hosts (
        host_id INTEGER PRIMARY KEY,
        host_name TEXT
    )
    ''')

    # Tabela para os bairros (Neighbourhoods)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Neighbourhoods (
        neighbourhood_id INTEGER PRIMARY KEY AUTOINCREMENT,
        neighbourhood_name TEXT UNIQUE,
        neighbourhood_group TEXT
    )
    ''')

    # Tabela principal para os anúncios (Listings)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Listings (
        listing_id INTEGER PRIMARY KEY,
        name TEXT,
        host_id INTEGER,
        neighbourhood_id INTEGER,
        latitude REAL,
        longitude REAL,
        room_type TEXT,
        price INTEGER,
        minimum_nights INTEGER,
        number_of_reviews INTEGER,
        last_review TEXT,
        reviews_per_month REAL,
        calculated_host_listings_count INTEGER,
        availability_365 INTEGER,
        license TEXT,
        FOREIGN KEY (host_id) REFERENCES Hosts (host_id),
        FOREIGN KEY (neighbourhood_id) REFERENCES Neighbourhoods (neighbourhood_id)
    )
    ''')

    print("Tabelas criadas com sucesso.")

    # --- PROCESSAMENTO E INSERÇÃO DOS DADOS ---
    
    # Usamos conjuntos (sets) para rastrear IDs já inseridos e evitar consultas repetidas
    inserted_hosts = set()
    neighbourhood_map = {}

    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                # 1. Inserir Host (se ainda não existir)
                host_id = int(row['host_id'])
                if host_id not in inserted_hosts:
                    cursor.execute(
                        "INSERT OR IGNORE INTO Hosts (host_id, host_name) VALUES (?, ?)",
                        (host_id, row['host_name'])
                    )
                    inserted_hosts.add(host_id)
                
                # 2. Inserir Bairro (se ainda não existir) e obter o ID
                neighbourhood_name = row['neighbourhood']
                if neighbourhood_name not in neighbourhood_map:
                    cursor.execute(
                        "INSERT OR IGNORE INTO Neighbourhoods (neighbourhood_name, neighbourhood_group) VALUES (?, ?)",
                        (neighbourhood_name, row['neighbourhood_group'])
                    )
                    # Busca o ID do bairro que acabamos de inserir (ou que já existia)
                    cursor.execute("SELECT neighbourhood_id FROM Neighbourhoods WHERE neighbourhood_name = ?", (neighbourhood_name,))
                    neighbourhood_id = cursor.fetchone()[0]
                    neighbourhood_map[neighbourhood_name] = neighbourhood_id
                else:
                    neighbourhood_id = neighbourhood_map[neighbourhood_name]

                # 3. Inserir o Anúncio (Listing)
                # Converte o preço para inteiro, tratando casos vazios como Nulo (None)
                price = int(row['price']) if row['price'] else None
                
                cursor.execute('''
                INSERT OR REPLACE INTO Listings (
                    listing_id, name, host_id, neighbourhood_id, latitude, longitude,
                    room_type, price, minimum_nights, number_of_reviews, last_review,
                    reviews_per_month, calculated_host_listings_count, availability_365, license
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    int(row['id']),
                    row['name'],
                    host_id,
                    neighbourhood_id,
                    float(row['latitude']),
                    float(row['longitude']),
                    row['room_type'],
                    price,
                    int(row['minimum_nights']),
                    int(row['number_of_reviews']),
                    row['last_review'],
                    float(row['reviews_per_month']),
                    int(row['calculated_host_listings_count']),
                    int(row['availability_365']),
                    row['license']
                ))

    except FileNotFoundError:
        print(f"Erro: Arquivo '{csv_file}' não encontrado. Verifique o nome e o local do arquivo.")
        return
    except Exception as e:
        print(f"Ocorreu um erro durante o processamento: {e}")
        conn.rollback() # Desfaz as alterações em caso de erro
    else:
        conn.commit() # Salva todas as alterações no banco de dados
        print(f"Dados do arquivo '{csv_file}' inseridos com sucesso no banco '{db_name}'.")
    finally:
        conn.close() # Fecha a conexão com o banco

# --- Executa a função ---
if __name__ == "__main__":
    criar_banco()