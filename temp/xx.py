                with source_conn.cursor() as cursor:                    
                    for source_tabel_name in source_tables:
                        cursor.execute(f"SHOW TABLES LIKE '{source_tabel_name}'")
                        table_exists = cursor.fetchone() is not None
                        
                        print(table_exists)