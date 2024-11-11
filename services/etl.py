import pymysql
import json
import sys
from connection import create_connection, close_connection
from datetime import datetime
from dateutil import parser
import sys
import pymysql
import pandas as pd

# Fungsi untuk memuat konfigurasi database
def load_db_config():
    with open('config/database.json', 'r') as f:
        return json.load(f)



def extract_data(conn, table_name, time_last_load, batch_size=500):
    try:
        # Membuat query untuk mengekstrak data berdasarkan kolom created_at atau updated_at
        with conn.cursor() as cursor:
            cursor.execute(f"SHOW COLUMNS FROM {table_name}")
            columns = cursor.fetchall()
            
            has_created_at = any(column[0] == "created_at" for column in columns)
            has_updated_at = any(column[0] == "updated_at" for column in columns)

            if has_created_at or has_updated_at:
                if has_created_at and has_updated_at:
                    condition_query = "(GREATEST(created_at, updated_at) > %s)"
                elif has_created_at:
                    condition_query = "created_at > %s"
                else:
                    condition_query = "updated_at > %s"

                # Membuat query ekstraksi data
                query = f"SELECT * FROM {table_name} WHERE {condition_query} LIMIT %s OFFSET %s"
                offset = 0
                extracted_data = []  # List untuk menampung data dalam batch

                while True:
                    # Mengambil data dalam batch menggunakan Pandas
                    df = pd.read_sql(query, conn, params=(time_last_load, batch_size, offset))

                    if df.empty:
                        break
                    
                    # Menambahkan data yang diambil ke dalam list
                    extracted_data.append(df)

                    # Update offset untuk batch berikutnya
                    offset += batch_size

                if extracted_data:
                    # Menggabungkan semua batch menjadi satu DataFrame
                    full_data = pd.concat(extracted_data, ignore_index=True)
                    return full_data
                else:
                    print("No data extracted.")
                    return pd.DataFrame()  # Mengembalikan DataFrame kosong jika tidak ada data

    except pymysql.MySQLError as e:
        print(f"Error saat mengekstrak data: {e}")
        return pd.DataFrame()  # Mengembalikan DataFrame kosong jika terjadi error


def etl_process(source, target, time_last_load):
    db_config = load_db_config()

    source_conn = create_connection(db_config[source])
    target_conn = create_connection(db_config[target])

    if source_conn and target_conn:
        try:
            with source_conn.cursor() as cursor:
                cursor.execute("SHOW TABLES")
                tables = cursor.fetchall()
                
                for (table_name,) in tables:
                    # Ekstrak data dari database operasional
                    extracted_data = extract_data(source_conn, table_name, time_last_load)
                    
                    print(extracted_data)

                    
                    # Load data ke staging atau data warehouse
                    # load_data(target_conn, extracted_data)
                
        except pymysql.MySQLError as e:
            print(f"Error saat proses ETL: {e}")
        finally:
            close_connection(db_config[source]["dbName"])
            close_connection(db_config[target]["dbName"])

if __name__ == "__main__":
    source = sys.argv[1]
    target = sys.argv[2]
    time_last_load = parser.parse(sys.argv[3])

    etl_process(source, target, time_last_load)