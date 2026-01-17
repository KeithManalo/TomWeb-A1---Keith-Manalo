# Valo.Rant - Valorant Community Web Service

A Node.js/Express web service for Valorant fans to browse agents, share patch notes, and post community rants.

## Features

- **Agent Finder**: Browse all Valorant agents with search and role filtering
- **Patch Notes**: View and manage (admin) game patch notes
- **Community Rants**: Post and reply to community posts
- **User Authentication**: Register and login system
- **Admin Dashboard**: Admins can edit patch notes and moderate posts

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create `.env` file** (already included):
   ```
   PORT=3000
   NODE_ENV=development
   ```

3. **Run the server**:
   ```bash
   npm start
   ```

4. **Visit**: `http://localhost:3000`

## Deployment on Render

1. **Create a new Web Service on Render**:
   - Connect your GitHub repository
   - Set environment: Node.js
   - Build command: `npm install`
   - Start command: `npm start`

2. **Environment variables** (set in Render dashboard):
   ```
   PORT=3000
   NODE_ENV=production
   ```

3. Your app will be deployed at: `https://your-app-name.onrender.com`

## API Endpoints

### Agents
- `GET /api/agents` - Get all playable agents from Valorant API

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `DELETE /api/posts/:id` - Delete post (admin only)
- `POST /api/posts/:id/reply` - Add reply to post
- `DELETE /api/posts/:postId/reply/:replyId` - Delete reply (admin only)

### Patches
- `GET /api/patches` - Get all patch notes
- `POST /api/patches` - Create new patch (admin only)
- `PUT /api/patches/:id` - Update patch (admin only)
- `DELETE /api/patches/:id` - Delete patch (admin only)

## Admin Account

- **Username**: Admin
- **Email**: admin@gmail.com
- **Password**: access

## File Structure

```
.
├── server.js              # Express server
├── package.json           # Dependencies
├── .env                   # Environment variables
├── .gitignore
├── public/                # Static files
│   ├── index.html
│   ├── agents.html
│   ├── patch.html
│   ├── rant.html
│   ├── login.html
│   ├── styles.css
│   ├── agents.js
│   ├── login.js
│   ├── rant.js
│   ├── patch.js
│   └── webimage/
```

## Notes

- User data is stored in-memory (resets on server restart)
- For production, use a database like MongoDB or PostgreSQL
- Update email.js to use a proper email service (SendGrid, Nodemailer, etc.)

## License

ISC
