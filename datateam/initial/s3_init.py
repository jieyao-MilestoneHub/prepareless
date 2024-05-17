import os, sys
# from dotenv import load_dotenv
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from handler import S3Handler

bucket_name = 'prepareless-datateam'
s3_handler = S3Handler(bucket_name)

# 檢查 S3 存儲桶
s3_handler.validate_bucket()

# 創建資料夾結構
folder_structure = [
    'raw_data/input/',
    'raw_data/initial_check/',
    'structured_data/numeric/',
    'structured_data/categorical/',
    'structured_data/text/',
    'processed_data/numeric/',
    'processed_data/categorical/',
    'processed_data/text/',
    'transformed_data/training_set/',
    'transformed_data/validation_set/',
    'transformed_data/test_set/',
    'logs/errors/',
    'logs/processing_logs/',
    'results/final_output/'
]

for folder in folder_structure:
    s3_handler.create_folder(folder)
