from sqlalchemy import text

def load_data_stg(stg_conn, data, source_table, table_info):
    if data.empty or table_info is None:
        return

    destination_table = "stg_" + source_table

    # Memeriksa apakah tabel ada
    check_table_query = text(f"SHOW TABLES LIKE :destination_table")
    table_exists = stg_conn.execute(check_table_query, {"destination_table": destination_table}).fetchone() is not None

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

        stg_conn.execute(text(create_table_query))
        print(f"Tabel {destination_table} dibuat.")

    # Menyimpan data ke tabel staging
    data.to_sql(destination_table, stg_conn.engine, if_exists='append', index=False)
    
    stg_conn.commit()
    
    print(f"{len(data)} baris data dimasukkan ke tabel {destination_table}.")


def load_data_dwh(dwh_conn, data, destination_table, duplicate_key):
    if data.empty:
        return

    # Menentukan kolom yang akan diperbarui jika terjadi duplikasi
    non_key_columns = [col for col in data.columns if col not in duplicate_key]
    
    # Mengatur query untuk upsert
    insert_query = f"""
    INSERT INTO {destination_table} ({', '.join(data.columns)})
    VALUES ({', '.join([f':{col}' for col in data.columns])})
    ON DUPLICATE KEY UPDATE
    {', '.join([f"{col} = VALUES({col})" for col in (non_key_columns if non_key_columns else duplicate_key)])}
    """

    # Melakukan upsert per baris
    for _, row in data.iterrows():
        dwh_conn.execute(text(insert_query), row.to_dict())
        
    dwh_conn.commit()

    print(f"{len(data)} baris data diperbarui atau dimasukkan ke tabel {destination_table}.")

