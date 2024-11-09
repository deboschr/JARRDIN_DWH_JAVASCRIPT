import json
from connection import create_connection
from extract import extract_data
from transform import transform_data
from load import load_data

# Menyimpan koneksi untuk berbagai database
CONNECTIONS = {}

# Membaca konfigurasi database dari file konfigurasi
def load_db_config():
    with open('config/database.json', 'r') as f:
        return json.load(f)


# Fungsi ETL lengkap
def etl_process():
    # Memuat konfigurasi database
    db_config = load_db_config()

    # Membuat koneksi untuk operasional dan staging
    opt_conn = create_connection(db_config['opt'])
    stg_conn = create_connection(db_config['stg'])

    if opt_conn and stg_conn:
        # Extract data dari database operasional
        data = extract_data(opt_conn)
        
        if data:
            # Transformasi data jika perlu
            transformed_data = transform_data(data)
            
            # Load data ke database staging
            load_data(stg_conn, transformed_data)
        
        # Menutup koneksi
        opt_conn.close()
        stg_conn.close()

# Menjalankan proses ETL
if __name__ == "__main__":
    etl_process()
