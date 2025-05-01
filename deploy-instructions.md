# Deployment Instructions

## GitHub Setup

1. After creating your GitHub repository, run these commands (replace `<your-github-username>` with your GitHub username):

```bash
git remote add origin https://github.com/<your-github-username>/document-portal.git
git branch -M main
git push -u origin main
```

## Deployment Options

### Option 1: Render.com (Recommended)

1. Sign up for a free account at render.com
2. Connect your GitHub repository
3. Create a new Web Service for the backend:
   - Choose your repository
   - Set build command: `npm install`
   - Set start command: `node server/index.js`
   - Add environment variables:
     - `PORT`: 9000
     - `JWT_SECRET`: (generate a secure random string)

4. Create a new Static Site for the frontend:
   - Choose your repository
   - Set build command: `cd client && npm install && npm run build`
   - Set publish directory: `client/build`
   - Add environment variable:
     - `REACT_APP_API_URL`: Your backend service URL

### Option 2: Heroku

1. Sign up for a Heroku account
2. Install Heroku CLI
3. Run these commands:
```bash
heroku create document-portal
heroku config:set JWT_SECRET=<your-secret>
git push heroku main
```

### Option 3: Railway.app

1. Sign up for Railway.app
2. Connect your GitHub repository
3. Create a new project
4. Deploy from GitHub repository
5. Add environment variables in Railway dashboard

## Important Notes

1. Update the API URL in `client/src/services/api.ts` to point to your deployed backend URL
2. Ensure all environment variables are properly set
3. Make sure the database path is configured correctly for production
4. Consider using a production-grade database like PostgreSQL for better scalability 