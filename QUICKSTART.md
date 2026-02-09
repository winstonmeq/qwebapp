# Quick Start Guide

## Emergency Management System - Setup in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up MongoDB Atlas (Free)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (select FREE tier - M0)
4. Wait for cluster to be created (2-3 minutes)
5. Click "Connect" button
6. Choose "Connect your application"
7. Copy the connection string (looks like: `mongodb+srv://...`)

### Step 3: Configure Environment

Create `.env.local` file in the project root:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/emergency-db?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace `<username>` and `<password>` with your MongoDB credentials.

**Generate NextAuth Secret:**
```bash
openssl rand -base64 32
```
Copy the output and paste it as your `NEXTAUTH_SECRET`

### Step 4: Seed Demo Users (Optional)

```bash
npm run seed
```

This creates three demo accounts:
- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123  
- **Responder**: responder@example.com / responder123

### Step 5: Run the Application

```bash
npm run dev
```

### Step 6: Test the System

1. **Sign In**: http://localhost:3000/auth/signin
   - Use demo credentials (admin@example.com / admin123)
   - Or create a new account at /auth/signup

2. **Open Dashboard**: http://localhost:3000
   - View the emergency management dashboard
   - See your user info in the header
   - See statistics and map

3. **Test Admin Features**: http://localhost:3000/admin (admin only)
   - View all users
   - Change user roles
   - Manage system users

4. **Test Emergency Reporting**: http://localhost:3000/report
   - Fill in the form
   - Allow location access when prompted
   - Submit an emergency

5. **Test GPS Tracking**: http://localhost:3000/gps-simulator.html
   - Enter name and phone number
   - Click "Get GPS Location"
   - Click "Start Tracking"
   - Location will be sent every 5 seconds

### Testing Workflow

1. Sign in with admin account
2. Open GPS Simulator in one browser tab
3. Open Dashboard in another tab
4. Start GPS tracking in the simulator
5. Watch the user appear on the dashboard map
6. Submit an emergency from the /report page
7. See the emergency appear on the dashboard
8. Test admin dashboard features

### Common Issues

**Issue**: Can't connect to MongoDB
- **Solution**: Check your connection string in `.env.local`
- Make sure to replace `<username>` and `<password>`
- Whitelist your IP address in MongoDB Atlas (Network Access)

**Issue**: Location not detected
- **Solution**: Make sure you're using HTTPS or localhost
- Allow location permissions in your browser
- Try using a different browser (Chrome recommended)

**Issue**: Map not loading
- **Solution**: Check console for errors
- Make sure you're connected to the internet
- Clear browser cache and refresh

### Next Steps

- Customize the map center location in `components/EmergencyMap.tsx`
- Add authentication for production use
- Configure notification system
- Add more emergency types
- Integrate with SMS/Email services

### Production Deployment

1. **Vercel** (Recommended):
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel
   ```

2. **Add Environment Variables** in Vercel Dashboard:
   - `MONGODB_URI`: Your MongoDB connection string

3. **Configure Domain** (optional):
   - Add custom domain in Vercel settings

### Security Checklist

Before deploying to production:

- [ ] Enable authentication
- [ ] Add rate limiting
- [ ] Use HTTPS only
- [ ] Validate all inputs
- [ ] Add CORS policies
- [ ] Enable MongoDB IP whitelist
- [ ] Set up monitoring
- [ ] Add logging
- [ ] Create database backups
- [ ] Test on mobile devices

### Support

If you encounter issues:
1. Check the README.md for detailed documentation
2. Review the console for error messages
3. Verify environment variables are set correctly
4. Ensure MongoDB cluster is running

---

**Ready to go!** You now have a fully functional emergency management system. 🚀
