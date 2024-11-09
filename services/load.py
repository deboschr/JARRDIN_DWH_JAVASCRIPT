import pymysql

# Fungsi untuk memuat data ke database staging
def load_data(conn, data):
    try:
        with conn.cursor() as cursor:
            for row in data:
                query = """
                    INSERT INTO staging_table (col1, col2, col3)
                    VALUES (%s, %s, %s)
                """  # Sesuaikan dengan nama tabel dan kolom staging
                cursor.execute(query, (row['col1'], row['col2'], row['col3']))
            conn.commit()  # Menyimpan perubahan ke database
            print(f"Data berhasil dimuat ke staging.")
    except pymysql.MySQLError as e:
        print(f"Error saat memuat data ke staging: {e}")
        conn.rollback()  # Batalkan perubahan jika terjadi error
