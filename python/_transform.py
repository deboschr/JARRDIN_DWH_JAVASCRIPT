import pandas as pd
from sqlalchemy import text

def transform_data_resident(df_resident):
   
   if df_resident.empty:
      return df_resident
   
   # Memilih dan merename kolom untuk disesuaikan dengan tabel tujuan
   df_transformed = df_resident.rename(columns={
      'kode_pemilik_penyewa': 'resident_id',
      'nama_pemilik_penyewa': 'name',
      'no_ponsel': 'phone',
      'email': 'email',
      'alamat_pemilik_penyewa': 'address'
   })

   # Memastikan kolom yang tidak ada dalam tabel tujuan (seperti `created_at`, `updated_at`, dan `loaded_at`) dihapus
   df_transformed = df_transformed[['resident_id', 'name', 'phone', 'email', 'address']]
    
   # Mengembalikan df_resident yang sudah ditransformasi
   return df_transformed

   
def transform_data_tower(df_location):
   # Memilih kolom 'tower' dan menghapus duplikat
   df_tower = df_location[['tower']].drop_duplicates().rename(columns={'tower': 'name'})
      
   # Mengembalikan dataframe df_tower yang berisi data unik pada kolom 'name'
   return df_tower

def transform_data_floor(df_location, dwh_conn):
   # Mengambil data unik tower dan floor dari df_location
   df_floor_temp = df_location[['tower', 'floor']].drop_duplicates().rename(columns={'floor': 'name'})
      
   # Mendapatkan mapping tower_id dari dim_tower di database
   query = text("SELECT tower_id, name FROM dim_tower")
   df_tower = pd.read_sql(query, dwh_conn)
      
   # Gabungkan df_floor_temp dengan df_tower berdasarkan kolom 'tower' dan 'name'
   df_floor = df_floor_temp.merge(df_tower, left_on='tower', right_on='name', how='left')
      
   # Hapus kolom 'tower' dan rename kolom 'name_x' sebagai 'name' untuk kolom floor
   df_floor = df_floor.drop(columns=['tower', 'name_y']).rename(columns={'name_x': 'name'})
      
   # Mengembalikan dataframe df_floor yang berisi tower_id dan name
   return df_floor


def transform_data_unit(df_location, df_contract, dwh_conn):
   # Step 1: Ambil floor_id berdasarkan tower dan floor
   # Query untuk mendapatkan data floor dari dim_floor
   floor_query = text("SELECT floor_id, tower_id, name FROM dim_floor")
   df_floor = pd.read_sql(floor_query, dwh_conn)
      
   # Query untuk mendapatkan data tower dari dim_tower
   tower_query = text("SELECT tower_id, name FROM dim_tower")
   df_tower = pd.read_sql(tower_query, dwh_conn)
      
   # Gabungkan tower dan floor untuk mendapatkan floor_id
   df_floor = df_floor.merge(df_tower, left_on="tower_id", right_on="tower_id")
   df_location = df_location.merge(df_floor, left_on=["tower", "floor"], right_on=["name_y", "name"])
      
   # Step 2: Ambil resident_id berdasarkan kode_unit dari df_contract
   df_unit_temp = df_location.merge(df_contract[['kode_unit', 'kode_pemilik_penyewa']], on='kode_unit', how='left')
      
   # Step 3: Membentuk df_unit dengan kolom-kolom sesuai dengan dim_unit
   df_unit = df_unit_temp.rename(columns={
      "floor_id": "floor_id",
      "kode_pemilik_penyewa": "resident_id",
      "nama_unit": "name",
      "kode_tu": "type",
      "luas_unit": "area"
   })[["floor_id", "resident_id", "name", "type", "area"]]

   # Mengembalikan dataframe df_unit yang siap di-load ke dim_unit
   return df_unit
