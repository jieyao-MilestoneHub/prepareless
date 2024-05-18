# 部屬AWS

## Services
* Cloud9 - 前後端部署
* Bedrock - LLM Models
* SageMaker - Data Science
* S3 - Storage
* Amazon RDS PostgreSQL - for SageMaker vector database
* DynamoDB - Conversation History database
* Lambda - call function
* API gateway - bind Lambda function

## 待研究
* agants - 

## 介面功能
1. 多模態輸入 - 文字、圖片、影片、文件(pdf, word, txt...)
2. 多模態輸出 - 文字、影片、圖片、文件

## 1. 建立Cloud9 Environment
https://ap-northeast-1.console.aws.amazon.com/cloud9control/home

Name: build-agentic-assistant-ide
Description: null

- [x] New EC2 instance

- [x] m5.large

Platform: Amazon Linux 2023
Timout: 1 day

- [x] AWS Systems Manager(SSM)

進入剛剛建立的Cloud9
EC2 Instance -> Manage EC2 Instance
Elastic Block Store -> Volumns

進入該Volumns編輯頁 -> 右上角Modify -> 修改Size(至少1000GB) -> Modify! -> Modify!!!

回到EC2 Instance -> 選取該EC2 -> 右上角Instance State -> Reboot instance

備註: cloud9可以進入IDE編輯文件

## 2. 建立BedRock
https://ap-northeast-1.console.aws.amazon.com/bedrock/home

1. 進入右下角Model access
2. Manage Model Request
3. 全勾
4. Request
5. 等五分鐘

## 3. 建立Sagemaker
https://ap-northeast-1.console.aws.amazon.com/sagemaker/home

1. Set up for single user給他按下去
2. 當Domains Status轉為InService

## 4. 建立Service Quatas
https://ap-northeast-1.console.aws.amazon.com/servicequotas/home

1. 搜尋SageMaker
2. 進入服務
3. 加入服務p3 endpoint
4. 加入服務g4dn.4xlarge endpoint

## 5. 建立S3 bucket
https://ap-northeast-1.console.aws.amazon.com/s3/get-started

1. Create bucket
2. 設定名稱，檢查參數，其它保持預設值
3. Click create bucket

## 6. Database
### Amazon OpenSearch Service（前身為 Elasticsearch Service）
1. 定義：
    - OpenSearch 是一個開源的搜索和分析引擎，適合處理大量的文本數據和複雜的搜索查詢。
2. 主要功能：
    - 全文搜索：提供強大的全文搜索能力，可以快速查找文本數據中的關鍵詞和短語。
    * 數據分析：支援即時分析和可視化，適合大數據分析和監控。
    * 分布式架構：可以水平擴展，處理海量數據。
    * 安全性：提供內建的安全功能，如細粒度訪問控制和加密。
2. 使用場景：
    * 日誌和事件數據分析：例如應用程式監控、日誌分析和安全事件管理。
    * 網站搜索：為網站和應用程式提供快速的搜索功能。
    * 實時數據分析：例如電子商務網站上的產品搜索和推薦系統。


### Amazon Kendra
1. 定義：
    * Amazon Kendra 是一個機器學習驅動的企業搜索服務，設計用來構建智能搜索解決方案。
2. 主要功能：
    * 機器學習：利用機器學習技術提供更精確的搜索結果，能理解自然語言查詢。
    * 多資料來源集成：支援從多種資料來源（如 SharePoint、S3、RDS 等）進行數據檢索。
    * 問答系統：能直接回答用戶的具體問題，而不是僅僅提供關聯結果。
    * 安全和存取控制：確保用戶只能看到他們有權限訪問的數據。
3. 使用場景：
    * 企業內部搜索：在企業內部文檔、報告和其他資料中進行快速搜索。
    * 知識管理系統：構建知識庫，方便員工查找信息。
    * 支援系統：為客服或技術支援團隊提供快速問題解答工具。


### Amazon RDS for PostgreSQL
1. 定義：
    * PostgreSQL 是一個功能強大的開源關聯數據庫管理系統（RDBMS），適合存儲結構化數據。
2. 主要功能：
    * 關聯數據庫功能：支持ACID特性（原子性、一致性、隔離性和持久性），確保數據的完整性和一致性。
    * 擴展性：支持複雜查詢、觸發器、存儲過程和視圖等。
    * 擴展模塊：支持地理空間數據（PostGIS）、全文搜索、JSONB 和 XML 等。
    * 高可用性：支援多種備份和恢復策略，並提供讀寫分離和自動故障轉移功能。
3. 使用場景：
    * 傳統業務應用：如 ERP 系統、CRM 系統和財務系統。
    * Web 應用：支持基於 SQL 的應用開發。
    * 資料分析和 BI：適合結構化數據的存儲和查詢分析。


### 總結比較
* OpenSearch：適合需要強大搜索和實時分析能力的應用，例如日誌分析和網站搜索。
* Kendra：適合需要構建智能搜索解決方案的企業，特別是需要自然語言處理和問答功能的應用。
* PostgreSQL：適合需要可靠的關聯數據庫功能的應用，特別是需要複雜查詢和高可用性的業務應用。
