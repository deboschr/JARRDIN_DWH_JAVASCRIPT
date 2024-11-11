import pymysql
import json
import sys
from connection import create_connection, close_connection
from datetime import datetime
from dateutil import parser
import pandas as pd
from sqlalchemy import create_engine

def load_db_config():
    try:
        with open('config/database.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Configuration file not found.")
        sys.exit(1)

def extract_data(source_conn, table_name, time_last_load, batch_size=500):
    try:
        with source_conn.cursor() as cursor:
            # Mendapatkan informasi kolom
            cursor.execute(f"SHOW COLUMNS FROM {table_name}")
            columns = cursor.fetchall()
            
            # Mendapatkan primary key dari tabel
            cursor.execute(f"SHOW KEYS FROM {table_name} WHERE Key_name = 'PRIMARY'")
            primary_keys = cursor.fetchall()

            has_created_at = any(column[0] == "created_at" for column in columns)
            has_updated_at = any(column[0] == "updated_at" for column in columns)

            if has_created_at or has_updated_at:
                condition_query = "(GREATEST(created_at, updated_at) > %s)" if has_created_at and has_updated_at \
                    else "created_at > %s" if has_created_at else "updated_at > %s"

                query = f"SELECT * FROM {table_name} WHERE {condition_query} LIMIT %s OFFSET %s"
                offset = 0
                extracted_data = []

                while True:
                    df = pd.read_sql(query, source_conn, params=(time_last_load, batch_size, offset))
                    if df.empty:
                        break
                    extracted_data.append(df)
                    offset += batch_size

                if extracted_data:
                    full_data = pd.concat(extracted_data, ignore_index=True)
                    
                    # Mengembalikan data dan informasi tabel
                    table_info = {
                        "columns": columns,
                        "primary_keys": [pk[4] for pk in primary_keys]  # Mendapatkan nama kolom primary key
                    }
                    return full_data, table_info
                else:
                    print("No data extracted.")
                    return pd.DataFrame(), None
    except pymysql.MySQLError as e:
        print(f"Error saat mengekstrak data: {e}")
        return pd.DataFrame(), None

def load_data(target_conn, data, table_name, table_info, target):
    cursor = target_conn.cursor()
    target_table = f"stg_{table_name}" if target == "stg" else table_name

    # Memeriksa apakah tabel stg ada
    cursor.execute(f"SHOW TABLES LIKE '{target_table}'")
    table_exists = cursor.fetchone() is not None

    if not table_exists and target == "stg":
        # Membuat tabel staging baru dengan nama "stg" + nama tabel asli
        create_table_query = f"CREATE TABLE {target_table} ("
        column_definitions = []
        
        for column in table_info["columns"]:
            column_name = column[0]
            column_type = column[1]
            null_option = "NULL" if column[2] == "YES" else "NOT NULL"
            column_definitions.append(f"{column_name} {column_type} {null_option}")
        
        # Tambahkan kolom `loaded_at`
        column_definitions.append("loaded_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL")
        
        # Tambahkan definisi primary key
        primary_key_columns = table_info["primary_keys"] + ["loaded_at"]
        primary_key_definition = ", ".join(primary_key_columns)
        create_table_query += ", ".join(column_definitions) + f", PRIMARY KEY ({primary_key_definition}))"
        
        cursor.execute(create_table_query)
        print(f"Tabel {target_table} dibuat.")

    # Memasukkan data ke tabel
    if not data.empty:
        # Pastikan setiap elemen dari target_conn dikonversi ke string
        user = target_conn.user.decode() if isinstance(target_conn.user, bytes) else target_conn.user
        password = target_conn.password.decode() if isinstance(target_conn.password, bytes) else target_conn.password
        host = target_conn.host.decode() if isinstance(target_conn.host, bytes) else target_conn.host
        db = target_conn.db.decode() if isinstance(target_conn.db, bytes) else target_conn.db

        # Membangun URL koneksi
        db_url = f"mysql+pymysql://{user}:{password}@{host}/{db}"

        # Membuat koneksi SQLAlchemy dalam konteks 'with'
        with create_engine(db_url).connect() as connection:
            # Menambahkan kolom `loaded_at` pada DataFrame sebelum dimasukkan ke database
            data["loaded_at"] = pd.to_datetime(datetime.now())
            
            # Melakukan insert data menggunakan pandas.to_sql dengan koneksi SQLAlchemy
            data.to_sql(target_table, connection, if_exists='append', index=False)
            print(f"{len(data)} baris data dimasukkan ke tabel {target_table}.")
            
            connection.commit()
    
    target_conn.commit()
    cursor.close()

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
                    extracted_data, table_info = extract_data(source_conn, table_name, time_last_load)
                    
                    if not extracted_data.empty:
                        load_data(target_conn, extracted_data, table_name, table_info, target)
        except pymysql.MySQLError as e:
            print(f"Error during ETL process: {e}")
        finally:
            close_connection(db_config[source]["dbName"])
            close_connection(db_config[target]["dbName"])

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python etl.py <source> <target> <time_last_load>")
        sys.exit(1)

    source = sys.argv[1]
    target = sys.argv[2]
    try:
        time_last_load = parser.parse(sys.argv[3])
    except ValueError:
        print("Invalid date format for time_last_load.")
        sys.exit(1)

    etl_process(source, target, time_last_load)
