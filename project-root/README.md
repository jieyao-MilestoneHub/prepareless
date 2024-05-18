# 資料夾結構
project-root/
│   README.md
│   package.json
│   tsconfig.json
│   cdk.json
│
├── amplify/
│   ├── backend/
│   │   ├── api/
│   │   └── auth/
│   └── src/
│       ├── index.html
│       ├── app.js
│       └── ...
│
├── cdk/
│   ├── bin/
│   │   └── cdk.ts
│   ├── lib/
│   │   ├── chatbot-stack.ts
│   │   └── ...
│   ├── lambda/
│   │   ├── chatbotHandler.ts
│   │   └── ...
│   ├── dynamodb/
│   │   └── schema.json
│   └── sagemaker/
│       └── invokeModel.ts
└── test/


## 部署步驟

npm install
npm run cdk deploy


啟動前端: npm start or cd ~/project-root/amplify/src && http-server



## 測試

- 透過API Gateway發送請求，測試Lambda函數與DynamoDB、Bedrock、RAG的整合：
1. 開啟API Gateway控制台
登入AWS管理控制台。
在服務清單中，選擇“API Gateway”。
2. 找到你的API並建立一個測試請求
在API Gateway控制台，找到並選擇你所建立的API（例如，ChatbotApi）。
在左側導覽列中，選擇「Resources」以查看API資源和方法。
找到你的POST方法，點擊以選擇它。
在右側的「Method Execution」頁面上，選擇「Test」按鈕。
3. 建立測試請求
在「Method Test」頁面上，你可以設定測試請求。

在「Request Body」欄位中，輸入一個範例請求體，例如：

json
複製程式碼
{
     "message": "Hello, chatbot!"
}
點擊“Test”按鈕發送請求。

4. 查看測試結果和回應
發送請求後，你將看到API Gateway顯示的回應和日誌輸出。
查看響應體，確保回傳的回應是你期望的格式和內容。
5. 查看CloudWatch日誌
開啟CloudWatch控制台：

在AWS管理控制台中，選擇「CloudWatch」。
在左側導覽列中，選擇“Logs”。
找到你的Lambda函數的日誌組，名稱通常為/aws/lambda/your-function-name。
查看日誌流：

點選日誌組，查看最近的日誌流。
點選最近的日誌流，查看Lambda函數的日誌輸出。
檢查日誌以確認Lambda函數正確處理了請求，並與DynamoDB、Bedrock進行互動。