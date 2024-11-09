import pymysql

# Fungsi untuk mengekstrak data dari database operasional
def extract_data(conn):
    try:
        with conn.cursor() as cursor:
            query = "SELECT * FROM operational_table"  # Ganti dengan nama tabel operasional yang sesuai
            cursor.execute(query)
            data = cursor.fetchall()
            return data
    except pymysql.MySQLError as e:
        print(f"Error saat mengekstrak data: {e}")
        return None
