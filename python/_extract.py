import pandas as pd
from sqlalchemy import text

def extract_data(source_conn, table_name, time_last_load, batch_size=500):
    try:
        # Mendapatkan informasi kolom
        columns_query = text(f"SHOW COLUMNS FROM {table_name}")
        columns = source_conn.execute(columns_query).fetchall()
        
        # Mendapatkan primary key dari tabel
        primary_key_query = text(f"SHOW KEYS FROM {table_name} WHERE Key_name = 'PRIMARY'")
        primary_keys = source_conn.execute(primary_key_query).fetchall()

        # Memeriksa apakah kolom 'created_at' dan 'updated_at' ada
        has_created_at = any(column[0] == "created_at" for column in columns)
        has_updated_at = any(column[0] == "updated_at" for column in columns)

        if has_created_at or has_updated_at:
            # Menentukan kondisi query berdasarkan kolom 'created_at' dan 'updated_at'
            condition_query = (
                "(GREATEST(created_at, updated_at) > :time_last_load)"
                if has_created_at and has_updated_at
                else "created_at > :time_last_load"
                if has_created_at
                else "updated_at > :time_last_load"
            )

            # Query untuk pengambilan data dengan kondisi dan pembatasan batch
            query = text(f"SELECT * FROM {table_name} WHERE {condition_query} LIMIT :batch_size OFFSET :offset")
            offset = 0
            extracted_data = []

            # Ekstraksi data batch-wise
            while True:
                df = pd.read_sql(query, source_conn, params={"time_last_load": time_last_load, "batch_size": batch_size, "offset": offset})
                if df.empty:
                    break
                extracted_data.append(df)
                offset += batch_size

            if extracted_data:
                # Menggabungkan semua batch data
                full_data = pd.concat(extracted_data, ignore_index=True)
                
                # Menyusun informasi tabel untuk dikembalikan
                table_info = {
                    "columns": [(col[0], col[1], col[2]) for col in columns],  # Ambil nama kolom, tipe data, dan nullable
                    "primary_keys": [pk[4] for pk in primary_keys]  # Mengambil nama kolom primary key dengan indeks 4
                }
                return full_data, table_info
            else:
                print("No data extracted.")
                return pd.DataFrame(), None
    except Exception as e:
        print(f"Error saat mengekstrak data: {e}")
        return pd.DataFrame(), None
