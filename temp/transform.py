# Fungsi untuk mentransformasi data sesuai kebutuhan
def transform_data(stg_conn, dwh_conn, data):
    transformed_data = []
    for row in data:
        # Transformasi data sesuai kebutuhan
        # Misalnya: perubahan format atau penambahan kolom
        transformed_row = {
            'col1': row[0],  # Ganti dengan indeks kolom yang sesuai
            'col2': row[1],
            'col3': row[2],
            # Transformasi lainnya jika diperlukan
        }
        transformed_data.append(transformed_row)
    return transformed_data
