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