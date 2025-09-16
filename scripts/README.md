# Firestore Seed Users Guide

This guide explains how to seed your Firestore database with 30 realistic test users for testing the Campus Connect app.

## Prerequisites

1. **Firebase Admin SDK Setup**: You need a service account key from your Firebase project
2. **Node.js**: Ensure you have Node.js installed
3. **Firebase Admin Package**: Will be installed automatically

## Setup Instructions

### Step 1: Get Your Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`anonymous-feedback-platform`)
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to the **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file
7. **Rename it to `serviceAccountKey.json`**
8. **Place it in the `scripts/` folder**

### Step 2: Install Dependencies

```bash
# Navigate to your project root
cd campus-connect-app

# Install Firebase Admin SDK
npm install firebase-admin --save-dev
```

### Step 3: Run the Seed Script

```bash
# Run the seeding script
npm run seed:users
```

Or run directly:

```bash
node scripts/seedTestUsers.js
```

## What the Script Does

### 🧑‍🎓 **Generates 30 Realistic Users** with:

- **Names**: Indian first and last names
- **Branches**: CS, IT, Mechanical, Civil, Electronics, etc.
- **Years**: 1st, 2nd, 3rd, 4th year students
- **Colleges**: IITs, NITs, BITS, VIT, etc.
- **Skills**: Python, React, Machine Learning, UI/UX, etc.
- **Interests**: Hackathons, Open Source, Study Groups, etc.
- **Bio**: Engaging personal bios
- **Social**: GitHub and LinkedIn usernames
- **Timestamps**: Proper Firestore timestamps

### 📊 **Sample User Structure**:
```javascript
{
  bio: "Passionate about technology and innovation! 🚀",
  branch: "Computer Science",
  college: "IIT Delhi",
  createdAt: Firestore.Timestamp,
  fullName: "Aarav Sharma",
  github: "aaravsharma123",
  interests: ["Hackathons", "Open Source", "Study Groups"],
  linkedin: "Aarav-Sharma",
  photoURL: null,
  profileComplete: true,
  skills: ["Python", "React", "Machine Learning"],
  updatedAt: Firestore.Timestamp,
  year: "3rd",
  email: "aarav.sharma@iitdelhi.edu",
  displayName: "Aarav Sharma",
  isActive: true,
  lastSeen: Firestore.Timestamp
}
```

## Testing Features

After seeding, you can test:

✅ **Matching System**: Swipe through 30 different profiles  
✅ **Group Creation**: See diverse users in group member lists  
✅ **Event Participation**: Various users can join events  
✅ **Chat System**: Multiple users for chat testing  
✅ **Profile Browsing**: Rich variety of profiles to explore  

## Security Notes

⚠️ **IMPORTANT**: 
- **Never commit `serviceAccountKey.json` to version control**
- The script adds this file to `.gitignore` automatically
- Use environment variables in production
- These are test users only - not for production use

## Customization

You can modify the script to:
- Change the number of users (currently 30)
- Add different colleges, branches, or skills
- Include profile photos (add URLs to `photoURL`)
- Modify bio templates
- Add more user fields

## Troubleshooting

### "Module not found: firebase-admin"
```bash
npm install firebase-admin --save-dev
```

### "Service account key not found"
- Ensure `serviceAccountKey.json` is in the `scripts/` folder
- Check the file name is exactly `serviceAccountKey.json`

### "Permission denied"
- Verify your service account has Firestore write permissions
- Check your Firebase project ID matches in the script

### "Network error"
- Check your internet connection
- Verify Firebase project URL is correct

## After Seeding

1. **Restart your app** to see the new users
2. **Try the matching feature** - you should see 30+ profiles
3. **Create groups/events** - you'll see diverse user lists
4. **Test chat functionality** with multiple users

The users are marked as `profileComplete: true`, so they'll appear immediately in your app's main flow without needing profile setup.

---

**Happy Testing! 🚀**