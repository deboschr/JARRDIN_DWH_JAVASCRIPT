import pymysql
import json
from utils.connection import create_connection, close_connection
from temp.extract import extract_data
from temp.transform import transform_data
from temp.load import load_data

# Menyimpan koneksi untuk berbagai database
CONNECTIONS = {}

# Membaca konfigurasi database dari file konfigurasi
def load_db_config():
    with open('config/database.json', 'r') as f:
        return json.load(f)


# Fungsi ETL lengkap
def etl_process(source, target, time_last_load):
    # Memuat konfigurasi database
    db_config = load_db_config()

    # Membuat koneksi untuk operasional dan staging
    source_conn = create_connection(db_config[source])
    target_conn = create_connection(db_config[target])

    if source_conn and target_conn:
        
        if source == "opt" and target == "stg":
            try:
                with source_conn.cursor() as cursor:
                    cursor.execute("SHOW TABLES")
                    tables = cursor.fetchall()
                    
                    for (table_name,) in tables:
                        # Extract data dari database operasional
                        data = extract_data(source_conn, table_name, time_last_load)
                        
                        # Load data ke stanging
                        load_data(target_conn, data)
                
            except pymysql.MySQLError as e:
                print(f"Error saat mengekstrak data: {e}")
                return None
            
        elif source == "stg" and target == "dwh":
            # Extract data dari database staging
            data = extract_data(source_conn)
            
            # Transform data sebelum di load
            data_transfomerd = transform_data(source_conn, target_conn, data)
            
            # Load data ke data warehouse
            load_data(target_conn, data_transfomerd)
        else:
            # kembalikan pesan error
            print("Invalid source and target.")
        
        close_connection(db_config[source]["dbName"])
        close_connection(db_config[target]["dbName"])

# Menjalankan proses ETL
if __name__ == "__main__":
    etl_process()
