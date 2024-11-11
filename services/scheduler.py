from connection import create_connection, close_connection
from etl import etl_process 

import json
import pymysql
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime

# Inisialisasi Scheduler dan variabel global
global_scheduler = BackgroundScheduler()
global_scheduler.start()
global_jobs = {}

# Fungsi untuk memuat konfigurasi database
def load_db_config():
   with open('config/database.json', 'r') as f:
      return json.load(f)

def create_job(data_job, dwh_conn):
   
   # Parse time input to extract hour, minute, and second
   total_seconds = int(data_job["time"].total_seconds())
   hour = total_seconds // 3600
   minute = (total_seconds % 3600) // 60
   second = total_seconds % 60

   # Create a CronTrigger based on the period
   if data_job["period"] == 'MINUTE':
      trigger = CronTrigger(minute=f'*/{data_job["step"]}')
   elif data_job["period"] == 'HOUR':
      trigger = CronTrigger(hour=f'*/{data_job["step"]}')
   elif data_job["period"] == 'DAY':
      trigger = CronTrigger(day=f'*/{data_job["step"]}', hour=hour, minute=minute, second=second)
   elif data_job["period"] == 'MONTH':
      trigger = CronTrigger(month=f'*/{data_job["step"]}', hour=hour, minute=minute, second=second)
   else:
      raise ValueError("Invalid period specified. Choose from 'MINUTE', 'HOUR', 'DAY', or 'MONTH'.")

   # Define the job function
   def job_function():
      print(f"Job dijalankan! Sekarang: {datetime.now()}")
      
      config = data_job["config"]
      
      # Memanggil proses ETL
      etl_process(config["source"], config["target"], data_job["last_execute"])
      
      try:
         with dwh_conn.cursor() as cursor:
            # Gunakan query parameterized untuk menghindari masalah SQL injection
            query = "UPDATE job SET last_execute = NOW() WHERE job_id = %s"
            cursor.execute(query, (data_job["id"],))

      except pymysql.MySQLError as e:
         print(f"Error saat update last_execute pada job: {e}")
         return None

   # Add the job to the global_scheduler and save its job ID in the dictionary
   new_job = global_scheduler.add_job(job_function, trigger, id=data_job["name"])
   global_jobs[data_job["name"]] = new_job

def cancel_job(name):
    """Cancel a specific job by its job name (ID)."""
    if name in global_jobs:
        job = global_jobs.pop(name)  # Get job from dictionary and remove it
        job.remove()  # Remove the job from the scheduler
        print(f"Job '{name}' telah dibatalkan.")
    else:
        print(f"Job dengan nama '{name}' tidak ditemukan.")

      
def load_job():
   db_config = load_db_config()
   dwh_conn = create_connection(db_config["dwh"])

   try:
      with dwh_conn.cursor() as cursor:
         # Ambil semua data job dari tabel
         cursor.execute("SELECT * FROM job")
         jobs = cursor.fetchall()

         # Menyusun data_job sebagai dictionary berdasarkan nama kolom
         columns = [col[0] for col in cursor.description]  # Mendapatkan nama kolom
         
         for job in jobs:
            data_job = dict(zip(columns, job))  # Memetakan hasil query menjadi dictionary
            
            # Mendapatkan waktu saat ini
            current_time = datetime.now()
            
            print("data_job :", data_job)
            print("current_time :", current_time)
            print("time :", data_job["time"])
            print("last_execute :", data_job["last_execute"])
            create_job(data_job, dwh_conn)
   except pymysql.MySQLError as e:
      print(f"Error saat mengekstrak data: {e}")
      return None
   finally:
      dwh_conn.close()


# Panggil fungsi load_job secara langsung saat file ini dijalankan
if __name__ == "__main__":
   load_job()