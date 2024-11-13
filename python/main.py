import pymysql
import json
import sys
import pandas as pd
import json
from connection import create_connection, close_connection
from _extract import extract_data
from _transform import transform_data_resident,transform_data_location
from _load import load_data

# Variabel global untuk konfigurasi database
DB_CONFIG = {
    "dwh": {
        "host": "jadiin-developer.com",
        "database_name": "jadiinde_jarrdin_dwh",
        "username": "jadiinde_jarrdin_dwh",
        "password": "XV6HFaZvU5FNuJ9EVdLX"
    },
    "stg": {
        "host": "jadiin-developer.com",
        "database_name": "jadiinde_jarrdin_stg",
        "username": "jadiinde_jarrdin_stg",
        "password": "3UBETVp9Se8VsKVUBeJy"
    },
    "opt1": {
        "host": "jadiin-developer.com",
        "database_name": "jadiinde_jarrdin_opt1",
        "username": "jadiinde_jarrdin_opt1",
        "password": "76a4ELsFxPkRhhaUeJEX"
    }
}

def etl_process(dfJob):
    
    source_name = dfJob["source_name"].iloc[0]
    source_tables = json.loads(dfJob["source_tables"].iloc[0])
    destination_name = dfJob["destination_name"].iloc[0]
    destination_tables = json.loads(dfJob["destination_tables"].iloc[0])
    time_last_load = dfJob["updated_at"].iloc[0]
    
    source_conn = create_connection(DB_CONFIG[source_name])
    destination_conn = create_connection(DB_CONFIG[destination_name])
    
    if source_conn and destination_conn:
        try:
            if destination_name == "stg":
                with source_conn.cursor() as cursor:
                    cursor.execute("SHOW TABLES")
                    tables = cursor.fetchall()

                    for (table_name,) in tables:
                        extracted_data, table_info = extract_data(source_conn, table_name, time_last_load)

                        if not extracted_data.empty:
                            load_data(destination_conn, extracted_data, table_name, table_info, destination_name)

            elif destination_name == "dwh":
                # ini bisa print
                print(dfJob["name"].iloc[0])
                if dfJob["name"].iloc[0] == "RESIDENT":
                    source_tabel_name = source_tables[0]
                    extracted_data, _ = extract_data(source_conn, source_tabel_name, time_last_load)
                
                    transformed_data = transform_data_resident(extracted_data)
                    
                    # load_data(destination_conn, transformed_data, table_name, table_info, destination_name)
                elif dfJob["name"].iloc[0] == "LOCATION":
                    extracted_data, table_info = extract_data(source_conn, table_name, time_last_load)
                
                    transformed_data = transform_data_location(extracted_data)
                    
                    load_data(destination_conn, transformed_data, table_name, table_info, destination_name)
                else:
                    # tapi ini error, kenapa?
                    print(f"ETL for {dfJob['name'].iloc[0]} is not configure.")
                

        except pymysql.MySQLError as e:
            print(f"Error during ETL process: {e}")
        finally:
            close_connection(DB_CONFIG[source_name]["database_name"])
            close_connection(DB_CONFIG[destination_name]["database_name"])



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
                etl_process(dfJob)

        except pymysql.MySQLError as e:
            print(f"Error during get job: {e}")
        finally:
            close_connection(DB_CONFIG["dwh"]["database_name"])
