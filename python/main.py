import json
import sys
import pandas as pd
from sqlalchemy import text
from connection import create_connection, close_connection
from _extract import extract_data
from _transform import transform_data_resident, transform_data_tower, transform_data_floor, transform_data_unit, transform_data_contract, transform_data_invoice, transform_data_payment
from _load import load_data_stg, load_data_dwh

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
    source_tables = json.loads(dfJob["source_tables"].iloc[0] or "[]")
    destination_name = dfJob["destination_name"].iloc[0]
    destination_tables = json.loads(dfJob["destination_tables"].iloc[0] or "[]")
    time_last_load = dfJob["updated_at"].iloc[0]
    
    source_conn = create_connection(DB_CONFIG[source_name])
    destination_conn = create_connection(DB_CONFIG[destination_name])
    
    if source_conn and destination_conn:
        try:
            if destination_name == "stg":
                # Mengambil daftar tabel dari database sumber
                tables_query = text("SHOW TABLES")
                tables = source_conn.execute(tables_query).fetchall()
                
                for (table_name,) in tables:
                    df_extracted, table_info = extract_data(source_conn, table_name, time_last_load, "stg")
                    load_data_stg(destination_conn, df_extracted, table_name, table_info)

            elif destination_name == "dwh":

                source_table_name = source_tables[0]
                destination_table_name = destination_tables[0]
                duplicate_keys = json.loads(dfJob["duplicate_keys"].iloc[0] or "[]")
                
                df_extracted, _ = extract_data(source_conn, source_table_name, time_last_load, "dwh")
                
                df_transformed = pd.DataFrame()
                if dfJob['name'].iloc[0] == "TOWER":
                    df_transformed = transform_data_tower(df_extracted)
                elif dfJob['name'].iloc[0] == "FLOOR":
                    df_transformed = transform_data_floor(df_extracted, destination_conn)
                elif dfJob['name'].iloc[0] == "UNIT":
                    source_table_name2 = source_tables[1]
                    df_extracted2, _ = extract_data(source_conn, source_table_name2, time_last_load, "dwh")
                    df_transformed = transform_data_unit(df_extracted, df_extracted2, destination_conn)
                elif dfJob['name'].iloc[0] == "RESIDENT":  
                    df_transformed = transform_data_resident(df_extracted)
                elif dfJob['name'].iloc[0] == "CONTRACT":  
                    df_transformed = transform_data_contract(df_extracted, destination_conn)
                elif dfJob['name'].iloc[0] == "INVOICE":  
                    df_transformed = transform_data_invoice(df_extracted, destination_conn)
                elif dfJob['name'].iloc[0] == "PAYMENT":  
                    df_transformed = transform_data_payment(df_extracted, destination_conn)
                else:
                    print(f"ETL for {dfJob['name'].iloc[0]} is not configured.")
                    return
                
                load_data_dwh(destination_conn, df_transformed, destination_table_name, duplicate_keys)
                
                
        except Exception as e:
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
            # Mengambil data pekerjaan dari tabel `job`
            query = text("SELECT * FROM job WHERE name = :job_name")
            dfJob = pd.read_sql(query, dwh_conn, params={"job_name": job_name})
            if dfJob.empty:
                print(f"Job with name {job_name} not found.")
            else:
                etl_process(dfJob)

        except Exception as e:
            print(f"Error during get job: {e}")
        finally:
            close_connection(DB_CONFIG["dwh"]["database_name"])
