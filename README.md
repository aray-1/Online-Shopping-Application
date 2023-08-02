# RayMart

This project was created with the primary goal of practicing and improving ReactJS and Node.js skills by integrating these technologies together in a cohesive full-stack web application, and also learn various concepts, best practices and do's and dont's to create a functional application.

## Initialization

After cloning the repository follow the given steps:
1. run `npm install` in the root directory, at /frontend and at /backend
2. create a *.env* file in /backend and copy the format given below
3. create a database in mongoDB Atlas with a desired name and create collections with names present in the /backend/models
4. add documents to banner, category and item collections with formats specified in their respective models

## Running The Application
1. make sure you are in the root directory and all initialization steps are completed
2. run the command `npm run dev`. This will start the application.

### environment variable template

PASSWORD_HASH_SECRET_KEY=<YOUR_HASH_KEY>   
MONGODB_URI=<YOUR_MONGODB_CONNECTION_STRING>    
ACCESS_TOKEN_SECRET=<YOUR_TOKEN_SECRET>    
EMAIL_ID=<YOUR_EMAIL_ID>   
SMTP_PASSWORD=<YOUR_APP_PASSWORD>   
SMTP_PORT=<SMTP_PORT>   
SMTP_HOST=<SMTP_HOST>   
RAZORPAY_KEY_ID=<RAZORPAY_KEY_ID>   
RAZORPAY_KEY_SECRET=<RAZORPAY_KEY_SECRET>   

App password can be generated from your account settings