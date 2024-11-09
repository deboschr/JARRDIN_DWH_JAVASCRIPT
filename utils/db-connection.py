import pymysql

# Menyimpan koneksi untuk berbagai database
CONNECTIONS = {}

# Fungsi untuk membuat koneksi ke database
def create_connection(dataDb):
    global CONNECTIONS
    
    if dataDb.dbName not in CONNECTIONS or not CONNECTIONS[dataDb.dbName].open:
        try:
            # Membuat koneksi baru jika belum ada atau jika koneksi sebelumnya sudah tertutup
            CONNECTIONS[dataDb.dbName] = pymysql.connect(
                host=dataDb.host,
                user=dataDb.username,
                password=dataDb.password,
                database=dataDb.dbName
            )
            
            print(f"Koneksi ke {dataDb.dbName} berhasil!")
            return CONNECTIONS[dataDb.dbName]
        except pymysql.MySQLError as e:
            print(f"Error saat membuat koneksi ke {dataDb.dbName}: {e}")
            return None
    else:
        print(f"Koneksi ke {dataDb.dbName} sudah ada.")
        return CONNECTIONS[dataDb.dbName]

# Fungsi untuk menutup koneksi
def close_connection(dbName):
    global CONNECTIONS
    
    if dbName in CONNECTIONS:
        try:
            # Menutup koneksi jika ada
            CONNECTIONS[dbName].close()
            
            # Menghapus koneksi dari dictionary setelah ditutup
            del CONNECTIONS[dbName]
            
            print(f"Koneksi ke {dbName} ditutup.")
            
            return True
        except pymysql.MySQLError as e:
            print(f"Error saat menutup koneksi ke {dbName}: {e}")
            return False
    else:
        print(f"Tidak ada koneksi yang ditemukan untuk {dbName}.")
        return False

# Fungsi untuk mendapatkan koneksi
def get_connection(dbName=None):
    global CONNECTIONS
    
    if not dbName:  # Jika dbName tidak diberikan, kembalikan daftar nama koneksi
        return list(CONNECTIONS.keys())
    
    elif dbName in CONNECTIONS:  # Jika dbName ada di CONNECTIONS, kembalikan koneksi
        return CONNECTIONS[dbName]
    
    else:
        print(f"Tidak ada koneksi yang ditemukan untuk {dbName}.")
        return False
