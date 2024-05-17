import boto3
import botocore
import os

class S3Handler:
    def __init__(self, bucket_name, aws_region='us-west-2'):
        self.s3 = boto3.client('s3', region_name=aws_region)
        self.bucket_name = bucket_name

    def validate_bucket(self):
        """檢查 S3 存儲桶是否存在"""
        try:
            self.s3.head_bucket(Bucket=self.bucket_name)
            print(f"Bucket {self.bucket_name} exists and you have permission to access it.")
        except botocore.exceptions.ClientError as e:
            error_code = int(e.response['Error']['Code'])
            if error_code == 404:
                print(f"Bucket {self.bucket_name} does not exist.")
            else:
                print(f"Error occurred: {e}")

    def upload_file(self, file_name, object_name=None):
        """上傳檔案到 S3"""
        if object_name is None:
            object_name = os.path.basename(file_name)

        try:
            self.s3.upload_file(file_name, self.bucket_name, object_name)
            print(f"File {file_name} uploaded to {self.bucket_name}/{object_name}.")
        except Exception as e:
            print(f"Failed to upload {file_name} to {self.bucket_name}/{object_name}: {e}")

    def download_file(self, object_name, file_name=None):
        """從 S3 下載檔案"""
        if file_name is None:
            file_name = os.path.basename(object_name)

        try:
            self.s3.download_file(self.bucket_name, object_name, file_name)
            print(f"File {object_name} downloaded to {file_name}.")
        except Exception as e:
            print(f"Failed to download {object_name} from {self.bucket_name}: {e}")

    def delete_file(self, object_name):
        """從 S3 刪除檔案"""
        try:
            self.s3.delete_object(Bucket=self.bucket_name, Key=object_name)
            print(f"File {object_name} deleted from {self.bucket_name}.")
        except Exception as e:
            print(f"Failed to delete {object_name} from {self.bucket_name}: {e}")

    def list_files(self, prefix=''):
        """列出 S3 存儲桶中的檔案"""
        try:
            response = self.s3.list_objects_v2(Bucket=self.bucket_name, Prefix=prefix)
            if 'Contents' in response:
                print("Files in bucket:")
                for item in response['Contents']:
                    print(item['Key'])
            else:
                print(f"No files found in bucket {self.bucket_name} with prefix {prefix}.")
        except Exception as e:
            print(f"Failed to list files in {self.bucket_name}: {e}")

    def create_folder(self, folder_name):
        """在 S3 中創建資料夾"""
        try:
            self.s3.put_object(Bucket=self.bucket_name, Key=(folder_name + '/'))
            print(f"Folder {folder_name} created in {self.bucket_name}.")
        except Exception as e:
            print(f"Failed to create folder {folder_name} in {self.bucket_name}: {e}")