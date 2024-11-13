import pymysql
import json
import sys
from connection import create_connection, close_connection
from datetime import datetime
from dateutil import parser
import pandas as pd
from sqlalchemy import create_engine

# Variabel global untuk konfigurasi database
DB_CONFIG = {
    "dwh": {
        "host": "jadiin-developer.com",
        "dbName": "jadiinde_jarrdin_dwh",
        "username": "jadiinde_jarrdin_dwh",
        "password": "XV6HFaZvU5FNuJ9EVdLX"
    },
    "stg": {
        "host": "jadiin-developer.com",
        "dbName": "jadiinde_jarrdin_stg",
        "username": "jadiinde_jarrdin_stg",
        "password": "3UBETVp9Se8VsKVUBeJy"
    },
    "opt1": {
        "host": "jadiin-developer.com",
        "dbName": "jadiinde_jarrdin_opt1",
        "username": "jadiinde_jarrdin_opt1",
        "password": "76a4ELsFxPkRhhaUeJEX"
    },
    "opt2": {
        "host": "jadiin-developer.com",
        "dbName": "jadiinde_jarrdin_opt2",
        "username": "jadiinde_jarrdin_opt2",
        "password": "BvcWSJg7v3ew6umLUGkC"
    }
}

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

def transform_data():
    return None

def load_data(destination_conn, data, table_name, table_info, destination):
    cursor = destination_conn.cursor()
    destination_table = f"stg_{table_name}" if destination == "stg" else table_name

    # Memeriksa apakah tabel stg ada
    cursor.execute(f"SHOW TABLES LIKE '{destination_table}'")
    table_exists = cursor.fetchone() is not None

    if not table_exists and destination == "stg":
        # Membuat tabel staging baru dengan nama "stg" + nama tabel asli
        create_table_query = f"CREATE TABLE {destination_table} ("
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
        print(f"Tabel {destination_table} dibuat.")

    # Memasukkan data ke tabel
    if not data.empty:
        # Pastikan setiap elemen dari destination_conn dikonversi ke string
        user = destination_conn.user.decode() if isinstance(destination_conn.user, bytes) else destination_conn.user
        password = destination_conn.password.decode() if isinstance(destination_conn.password, bytes) else destination_conn.password
        host = destination_conn.host.decode() if isinstance(destination_conn.host, bytes) else destination_conn.host
        db = destination_conn.db.decode() if isinstance(destination_conn.db, bytes) else destination_conn.db

        # Membangun URL koneksi
        db_url = f"mysql+pymysql://{user}:{password}@{host}/{db}"

        # Membuat koneksi SQLAlchemy dalam konteks 'with'
        with create_engine(db_url).connect() as connection:
            # Menambahkan kolom `loaded_at` pada DataFrame sebelum dimasukkan ke database
            data["loaded_at"] = pd.to_datetime(datetime.now())
            
            # Melakukan insert data menggunakan pandas.to_sql dengan koneksi SQLAlchemy
            data.to_sql(destination_table, connection, if_exists='append', index=False)
            print(f"{len(data)} baris data dimasukkan ke tabel {destination_table}.")
            
            connection.commit()
    
    destination_conn.commit()
    cursor.close()

def etl_process(source, destination, time_last_load):

    source_conn = create_connection(DB_CONFIG[source])
    destination_conn = create_connection(DB_CONFIG[destination])
    
    if source_conn and destination_conn:
        try:
            with source_conn.cursor() as cursor:
                cursor.execute("SHOW TABLES")
                tables = cursor.fetchall()

                for (table_name,) in tables:
                    extracted_data, table_info = extract_data(source_conn, table_name, time_last_load)
                    
                    if destination == "dwh":
                        extracted_data = transform_data()
                    
                    if not extracted_data.empty:
                        load_data(destination_conn, extracted_data, table_name, table_info, destination)
        except pymysql.MySQLError as e:
            print(f"Error during ETL process: {e}")
        finally:
            close_connection(DB_CONFIG[source]["dbName"])
            close_connection(DB_CONFIG[destination]["dbName"])


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python etl.py <job_name>")
        sys.exit(1)

    job_name = sys.argv[1]
    
    dwh_conn = create_connection(DB_CONFIG["dwh"])
    
    if dwh_conn:
        try:
            query = "SELECT * FROM job WHERE name = %s"
            dfJob = pd.read_sql(query, dwh_conn, params=[job_name])
            
            if dfJob.empty:
                print(f"Job with name {job_name} not found.")
            else:
                source_name = dfJob["source_name"].iloc[0]
                source_tables = dfJob["source_tables"].iloc[0]
                destination_name = dfJob["destination_name"].iloc[0]
                destination_tables = dfJob["destination_tables"].iloc[0]
                time_last_load = dfJob["last_execute"].iloc[0]
                
                print("source_name =>", source_name)
                print("source_tables =>", source_tables)
                print("destination_name =>", destination_name)
                print("destination_tables =>", destination_tables)
                print("time_last_load =>", time_last_load)
                
                # etl_process(source_name, source_tables, destination_name, destination_tables, time_last_load)

        except pymysql.MySQLError as e:
            print(f"Error during get job: {e}")
        finally:
            close_connection(DB_CONFIG["dwh"]["dbName"])
