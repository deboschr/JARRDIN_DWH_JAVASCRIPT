import pymysql

# Fungsi untuk mengekstrak data dari database operasional
def extract_data(conn, table_name, time_last_load):
    try:
        with conn.cursor() as cursor:
            # Periksa apakah tabel memiliki kolom create_at atau update_at
            cursor.execute(f"SHOW COLUMNS FROM {table_name}")
            columns = cursor.fetchall()
                
            # Periksa keberadaan kolom `create_at` dan/atau `update_at`
            has_create_at = any(column[0] == "create_at" for column in columns)
            has_update_at = any(column[0] == "update_at" for column in columns)

            extracted_data = {}

            if has_create_at or has_update_at:
                # Tentukan kondisi filter hanya menggunakan kolom yang tersedia
                if has_create_at and has_update_at:
                    condition_query = "(GREATEST(create_at, update_at) > %s)"
                elif has_create_at:
                    condition_query = "create_at > %s"
                else:
                    condition_query = "update_at > %s"
                    
                query = f"SELECT * FROM {table_name} WHERE {condition_query}"
                    
                # Eksekusi query untuk data terbaru
                cursor.execute(query, (time_last_load,))
                data = cursor.fetchall()

                # Menyimpan data yang diekstrak dari tabel saat ini ke dictionary dengan nama tabel sebagai kunci
                extracted_data[table_name] = data
            
            return extracted_data

    except pymysql.MySQLError as e:
        print(f"Error saat mengekstrak data: {e}")
        return None
