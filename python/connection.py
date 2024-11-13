from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError

# Menyimpan koneksi untuk berbagai database
CONNECTIONS = {}

# Fungsi untuk membuat koneksi ke database
def create_connection(dataDb):
    global CONNECTIONS
    database_name = dataDb['database_name']
    
    # Membuat string koneksi dengan SQLAlchemy
    connection_url = f"mysql+pymysql://{dataDb['username']}:{dataDb['password']}@{dataDb['host']}/{dataDb['database_name']}"
    
    if database_name not in CONNECTIONS or CONNECTIONS[database_name] is None:
        try:
            # Membuat engine baru jika belum ada atau jika koneksi sebelumnya sudah tertutup
            engine = create_engine(connection_url)
            CONNECTIONS[database_name] = engine.connect()
            
            print(f">> Koneksi ke {database_name} berhasil!")
            return CONNECTIONS[database_name]
        except SQLAlchemyError as e:
            print(f">> Error saat membuat koneksi ke {database_name}: {e}")
            return None
    else:
        print(f">> Koneksi ke {database_name} sudah ada.")
        return CONNECTIONS[database_name]

# Fungsi untuk menutup koneksi
def close_connection(database_name):
    global CONNECTIONS
    
    if database_name in CONNECTIONS:
        try:
            # Menutup koneksi jika ada
            CONNECTIONS[database_name].close()
            
            # Menghapus koneksi dari dictionary setelah ditutup
            del CONNECTIONS[database_name]
            
            print(f">> Koneksi ke {database_name} ditutup.")
            
            return True
        except SQLAlchemyError as e:
            print(f">> Error saat menutup koneksi ke {database_name}: {e}")
            return False
    else:
        print(f">> Tidak ada koneksi yang ditemukan untuk {database_name}.")
        return False

# Fungsi untuk mendapatkan koneksi
def get_connection(database_name=None):
    global CONNECTIONS
    
    if not database_name:  # Jika database_name tidak diberikan, kembalikan daftar nama koneksi
        return list(CONNECTIONS.keys())
    
    elif database_name in CONNECTIONS:  # Jika database_name ada di CONNECTIONS, kembalikan koneksi
        return CONNECTIONS[database_name]
    
    else:
        print(f">> Tidak ada koneksi yang ditemukan untuk {database_name}.")
        return None
