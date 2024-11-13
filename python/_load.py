import pandas as pd
from sqlalchemy import create_engine

def load_data_stg(stg_conn, data, source_table, table_info):
    
    if data.empty or table_info == None:
        return
    
    cursor = stg_conn.cursor()
    destination_table = "stg_" + source_table
    
    # Memeriksa apakah tabel ada
    cursor.execute(f"SHOW TABLES LIKE '{destination_table}'")
    table_exists = cursor.fetchone() is not None
    
    if not table_exists:
        # Membuat tabel staging baru jika tidak ada
        create_table_query = f"CREATE TABLE {destination_table} ("
        column_definitions = []
        
        for column in table_info["columns"]:
            column_name = column[0]
            column_type = column[1]
            null_option = "NULL" if column[2] == "YES" else "NOT NULL"
            column_definitions.append(f"{column_name} {column_type} {null_option}")
        
        # Tambahkan kolom `loaded_at`
        column_definitions.append("loaded_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL")
        
        # Menambahkan primary key
        primary_key_columns = table_info["primary_keys"] + ["loaded_at"]
        primary_key_definition = ", ".join(primary_key_columns)
        create_table_query += ", ".join(column_definitions) + f", PRIMARY KEY ({primary_key_definition}))"
        
        cursor.execute(create_table_query)
        print(f"Tabel {destination_table} dibuat.")
        
    # Pastikan elemen-elemen koneksi destination_conn dikonversi ke string
    user = stg_conn.user.decode() if isinstance(stg_conn.user, bytes) else stg_conn.user
    password = stg_conn.password.decode() if isinstance(stg_conn.password, bytes) else stg_conn.password
    host = stg_conn.host.decode() if isinstance(stg_conn.host, bytes) else stg_conn.host
    db = stg_conn.db.decode() if isinstance(stg_conn.db, bytes) else stg_conn.db

    # Membangun URL koneksi
    db_url = f"mysql+pymysql://{user}:{password}@{host}/{db}"

    # Membuat koneksi SQLAlchemy dalam konteks 'with'
    with create_engine(db_url).connect() as connection:
        # Untuk staging: hanya lakukan INSERT
        data.to_sql(destination_table, connection, if_exists='append', index=False)
        print(f"{len(data)} baris data dimasukkan ke tabel {destination_table}.")
                
        connection.commit()

    stg_conn.commit()
    cursor.close()
    
def load_data_dwh(dwh_conn, data, destination_table, duplicate_key):
    if data.empty:
        return
    
    cursor = dwh_conn.cursor()
    
    # Pastikan elemen-elemen koneksi dwh_conn dikonversi ke string
    user = dwh_conn.user.decode() if isinstance(dwh_conn.user, bytes) else dwh_conn.user
    password = dwh_conn.password.decode() if isinstance(dwh_conn.password, bytes) else dwh_conn.password
    host = dwh_conn.host.decode() if isinstance(dwh_conn.host, bytes) else dwh_conn.host
    db = dwh_conn.db.decode() if isinstance(dwh_conn.db, bytes) else dwh_conn.db

    # Membangun URL koneksi
    db_url = f"mysql+pymysql://{user}:{password}@{host}/{db}"

    # Membuat koneksi SQLAlchemy dalam konteks 'with'
    with create_engine(db_url).connect() as connection:
        # Exclude primary key columns from the update list
        non_key_columns = [col for col in data.columns if col not in duplicate_key]

        # Perform upsert for data warehouse
        for _, row in data.iterrows():
            # Build the upsert query
            insert_query = f"""
            INSERT INTO {destination_table} ({', '.join(data.columns)})
            VALUES ({', '.join(['%s'] * len(row))})
            ON DUPLICATE KEY UPDATE
            {', '.join([f"{col} = VALUES({col})" for col in non_key_columns])}
            """
            # Execute the upsert query
            cursor.execute(insert_query, tuple(row))
        connection.commit()

    dwh_conn.commit()
    cursor.close()