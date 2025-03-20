# Deploying Dharmaverse on Render

This guide will help you deploy your Dharmaverse application on Render.com, replacing an existing service.

## Prerequisites

1. A Render.com account
2. Git repository with your Dharmaverse code
3. The existing service on Render you want to replace

## Option 1: Deploy via the Render Dashboard (Recommended for replacing a service)

1. **Log in to your Render account** at https://dashboard.render.com

2. **Navigate to the existing service** you want to replace.

3. **Update the existing service**:
   - Click on the service you want to replace
   - Go to "Settings"
   - Under the "Repository" section, click "Change"
   - Enter the URL of your Dharmaverse repository
   - Update the following settings:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run start`
   - Save changes

4. **Trigger a manual deploy**:
   - Go to the "Deploys" tab
   - Click "Manual Deploy" > "Deploy latest commit"

## Option 2: Deploy via render.yaml (Alternative method)

1. **Push your code** to your Git repository including the `render.yaml` file

2. **Create a new Blueprint**:
   - Go to the Render dashboard
   - Click "New" > "Blueprint"
   - Connect your Git repository containing the Dharmaverse code
   - Render will detect your `render.yaml` file and create the service(s) defined in it

3. **Apply the Blueprint**:
   - Review the services that will be created
   - Click "Apply" to create the services

4. **After deployment, update DNS if needed**:
   - If you had a custom domain on your old service, go to the service settings
   - Navigate to "Custom Domains" and add your domain

## Verify Deployment

Once deployed, Render will provide a unique URL to access your application. Visit the URL to make sure your Dharmaverse app is working as expected. 