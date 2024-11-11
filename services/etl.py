import pymysql
import json
import sys
from connection import create_connection, close_connection
from datetime import datetime
from dateutil import parser
import sys

# Fungsi untuk memuat konfigurasi database
def load_db_config():
    with open('config/database.json', 'r') as f:
        return json.load(f)

def extract_data(conn, table_name, time_last_load, batch_size=500):
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SHOW COLUMNS FROM {table_name}")
            columns = cursor.fetchall()
            
            has_created_at = any(column[0] == "created_at" for column in columns)
            has_updated_at = any(column[0] == "updated_at" for column in columns)

            if has_created_at or has_updated_at:
                if has_created_at and has_updated_at:
                    condition_query = "(GREATEST(created_at, updated_at) > %s)"
                elif has_created_at:
                    condition_query = "created_at > %s"
                else:
                    condition_query = "updated_at > %s"
                
                query = f"SELECT * FROM {table_name} WHERE {condition_query} LIMIT %s OFFSET %s"
                offset = 0
                extracted_data = []
                
                while True:
                    cursor.execute(query, (time_last_load, batch_size, offset))
                    batch = cursor.fetchall()
                    
                    if not batch:
                        break
                    
                    extracted_data.extend(batch)
                    offset += batch_size
                    
                return {table_name: extracted_data}
            
    except pymysql.MySQLError as e:
        print(f"Error saat mengekstrak data: {e}")
        return None

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
                    # Ekstrak data dari database operasional
                    extracted_data = extract_data(source_conn, table_name, time_last_load)
                    
                    print(extracted_data)
                    
                    # print(extracted_data)
                    # print(extracted_data)
                    # if extracted_data:
                    #     for table, data in extracted_data.items():
                    #         # Transformasi data jika target adalah data warehouse
                    #         if target == "dwh":
                    #             data = transform_data(data)
                    #         # Load data ke staging atau data warehouse
                    #         load_data(target_conn, table, data, target)
                
        except pymysql.MySQLError as e:
            print(f"Error saat proses ETL: {e}")
        finally:
            close_connection(db_config[source]["dbName"])
            close_connection(db_config[target]["dbName"])

if __name__ == "__main__":
    source = sys.argv[1]
    target = sys.argv[2]
    time_last_load = parser.parse(sys.argv[3])

    etl_process(source, target, time_last_load)