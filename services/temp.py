
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
