import pymysql
import pandas as pd

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
