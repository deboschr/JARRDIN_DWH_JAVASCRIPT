from datetime import datetime
import pandas as pd
from sqlalchemy import create_engine

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
