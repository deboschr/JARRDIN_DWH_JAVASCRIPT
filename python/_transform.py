import pandas as pd

def transform_data_resident(dataframe):
   
   if dataframe.empty:
      return dataframe
   
   # Memilih dan merename kolom untuk disesuaikan dengan tabel tujuan
   transformed_df = dataframe.rename(columns={
      'kode_pemilik_penyewa': 'resident_id',
      'nama_pemilik_penyewa': 'name',
      'no_ponsel': 'phone',
      'email': 'email',
      'alamat_pemilik_penyewa': 'address'
   })

   # Memastikan kolom yang tidak ada dalam tabel tujuan (seperti `created_at`, `updated_at`, dan `loaded_at`) dihapus
   transformed_df = transformed_df[['resident_id', 'name', 'phone', 'email', 'address']]
    
   # Mengembalikan dataframe yang sudah ditransformasi
   return transformed_df

   
def transform_data_location(dataframe):
   print("transform_data_location")