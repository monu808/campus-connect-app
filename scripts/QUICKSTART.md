# Quick Setup Guide for Test User Seeding

## What You Need

1. **Service Account Key** from Firebase Console
2. **Firebase Admin SDK** (will be installed automatically)

## Quick Steps

### 1. Install Dependencies
```bash
npm install firebase-admin --save-dev
```

### 2. Get Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `anonymous-feedback-platform`
3. Settings ⚙️ → Project Settings → Service Accounts
4. Click **"Generate New Private Key"**
5. Download the JSON file
6. Rename to `serviceAccountKey.json`
7. Put it in the `scripts/` folder

### 3. Run the Seeder
```bash
npm run seed:users
```

## What You'll Get

✅ **30 realistic fake users** with:
- Diverse Indian names and backgrounds
- Various engineering branches (CS, IT, Mechanical, etc.)
- Different college years (1st-4th)
- Real skills (Python, React, ML, etc.)
- Engaging interests (Hackathons, Open Source, etc.)
- GitHub and LinkedIn profiles
- Complete profiles ready for app testing

## Perfect for Testing

- **Matching/Swiping**: 30+ profiles to swipe through
- **Groups**: Diverse users to invite and collaborate with
- **Events**: Multiple attendees for your events
- **Chat**: Various users to message and chat with
- **Profile Browsing**: Rich variety of student profiles

---

**⚠️ Security Note**: Never commit `serviceAccountKey.json` to version control!