import pymysql
import json
import sys
from connection import create_connection, close_connection

# Fungsi untuk memuat konfigurasi database
def load_db_config():
    with open('config/database.json', 'r') as f:
        return json.load(f)

def extract_data(conn, table_name, time_last_load, batch_size=500):
    try:
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
                
                query = f"SELECT * FROM {table_name} WHERE {condition_query} LIMIT %s OFFSET %s"
                offset = 0
                extracted_data = []
                
                while True:
                    cursor.execute(query, (time_last_load, batch_size, offset))
                    batch = cursor.fetchall()
                    
                    if not batch:
                        break
                    
                    extracted_data.extend(batch)
                    offset += batch_size
                    
                return {table_name: extracted_data}
            
    except pymysql.MySQLError as e:
        print(f"Error saat mengekstrak data: {e}")
        return None

def transform_data(data):
    transformed_data = []
    for row in data:
        transformed_row = {
            'col1': row[0],
            'col2': row[1],
            'col3': row[2],
        }
        transformed_data.append(transformed_row)
    return transformed_data

def load_data(conn, table_name, data, target_type):
    try:
        with conn.cursor() as cursor:
            # Cek apakah tabel target sudah ada
            cursor.execute(f"SHOW TABLES LIKE '{table_name}'")
            result = cursor.fetchone()
            
            if not result:
                cursor.execute(f"CREATE TABLE {table_name} LIKE source_database.{table_name}")
                print(f"Tabel {table_name} berhasil dibuat di {target_type}")
            
            # Menambahkan data baru ke tabel target
            for row in data:
                columns = ", ".join(row.keys())
                placeholders = ", ".join(["%s"] * len(row))
                
                if target_type == "stg":
                    insert_query = f"INSERT IGNORE INTO {table_name} ({columns}, loaded_at) VALUES ({placeholders}, NOW())"
                else:
                    insert_query = f"INSERT IGNORE INTO {table_name} ({columns}) VALUES ({placeholders})"
                    
                cursor.execute(insert_query, tuple(row.values()))
            
            conn.commit()
            print(f"Data berhasil dimuat ke tabel {table_name} di {target_type}")

    except pymysql.MySQLError as e:
        print(f"Error saat memuat data ke {target_type}: {e}")
        conn.rollback()
        
def load_data(conn, table_name, data, target_type):
    try:
        with conn.cursor() as cursor:
            # Cek apakah tabel target sudah ada
            cursor.execute(f"SHOW TABLES LIKE '{table_name}'")
            result = cursor.fetchone()
            
            if not result:
                cursor.execute(f"CREATE TABLE {table_name} LIKE source_database.{table_name}")
                print(f"Tabel {table_name} berhasil dibuat di {target_type}")
            
            # Persiapkan data untuk batch insert
            rows = []
            columns = data[0].keys()  # Ambil nama kolom dari data pertama
            
            # Menambahkan data ke dalam list untuk batch insert
            for row in data:
                row_values = list(row.values())
                if target_type == "stg":
                    # Untuk staging, tambahkan kolom loaded_at
                    row_values.append("NOW()")
                rows.append(tuple(row_values))
            
            # Membuat query insert dengan placeholders
            placeholders = ", ".join(["%s"] * len(columns) + (", %s" if target_type == "stg" else ""))
            insert_query = f"INSERT IGNORE INTO {table_name} ({', '.join(columns)}, loaded_at) VALUES ({placeholders})" if target_type == "stg" else f"INSERT IGNORE INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})"
            
            # Bulk insert
            cursor.executemany(insert_query, rows)
            conn.commit()
            print(f"Data berhasil dimuat ke tabel {table_name} di {target_type}")

    except pymysql.MySQLError as e:
        print(f"Error saat memuat data ke {target_type}: {e}")
        conn.rollback()

def main(source, target, time_last_load):
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
                    # if extracted_data:
                    #     for table, data in extracted_data.items():
                    #         # Transformasi data jika target adalah data warehouse
                    #         if target == "dwh":
                    #             data = transform_data(data)
                            
                    #         # Load data ke staging atau data warehouse
                    #         load_data(target_conn, table, data, target)
                
        except pymysql.MySQLError as e:
            print(f"Error saat proses ETL: {e}")
        finally:
            close_connection(source)
            close_connection(target)

if __name__ == "__main__":
    # Mengambil parameter dari command line
    if len(sys.argv) > 3:
        source = sys.argv[1]
        target = sys.argv[2]
        time_last_load = int(sys.argv[3])
        main(source, target, time_last_load)
    else:
        print("Parameter tidak lengkap!")
