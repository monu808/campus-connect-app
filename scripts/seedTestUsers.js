const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// Note: You need to download your service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate New Private Key
// Save it as 'serviceAccountKey.json' in the scripts folder (don't commit this file!)

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://anonymous-feedback-platform-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

// Sample data arrays for generating realistic fake users
const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Ananya', 'Diya', 'Aadhya', 'Kavya', 'Anika', 'Riya', 'Sara', 'Myra', 'Priya', 'Aditi',
  'Rohan', 'Dev', 'Aryan', 'Rudra', 'Karan', 'Dhruv', 'Harsh', 'Yash', 'Shiv', 'Kabir'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Agarwal', 'Jain', 'Mehta', 'Shah',
  'Chopra', 'Malhotra', 'Kapoor', 'Bansal', 'Ahluwalia', 'Tiwari', 'Mishra', 'Pandey', 'Saxena', 'Joshi',
  'Reddy', 'Rao', 'Iyer', 'Nair', 'Pillai', 'Menon', 'Das', 'Ghosh', 'Bose', 'Chatterjee'
];

const branches = [
  'Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 
  'Electrical', 'Chemical', 'Biotechnology', 'Aerospace', 'Core'
];

const years = ['1st', '2nd', '3rd', '4th'];

const colleges = [
  'IIT Delhi', 'IIT Bombay', 'IIT Kanpur', 'IIT Madras', 'IIT Kharagpur',
  'BITS Pilani', 'NIT Trichy', 'NIT Warangal', 'IIIT Hyderabad', 'DTU',
  'VIT Vellore', 'Manipal Institute', 'SRM University', 'Amity University', 'Lovely Professional University'
];

const skills = [
  'Python', 'Java', 'JavaScript', 'C++', 'React', 'Node.js', 'Machine Learning', 
  'Data Science', 'UI/UX Design', 'Flutter', 'Android Development', 'iOS Development',
  'Web Development', 'Blockchain', 'Cybersecurity', 'Cloud Computing', 'DevOps',
  'Artificial Intelligence', 'Deep Learning', 'Database Management', 'Software Testing',
  'Game Development', 'Mobile App Development', 'Full Stack Development'
];

const interests = [
  'Hackathons', 'Research Projects', 'Study Groups', 'Open Source', 'Startups',
  'Competitive Programming', 'Tech Meetups', 'Innovation Challenges', 'Internships',
  'Project Collaboration', 'Skill Development', 'Mentorship', 'Networking Events',
  'Workshop Participation', 'Tech Conferences'
];

const bioTemplates = [
  "Passionate about technology and innovation! 🚀",
  "Building the future, one line of code at a time 💻",
  "Learning, coding, and growing every day 📚",
  "Tech enthusiast with a love for problem-solving ⚡",
  "Dreaming big and coding bigger! 🌟",
  "Always curious, always learning 🔍",
  "Turning ideas into reality through code 💡",
  "Future engineer in the making! 🛠️",
  "Coding my way to success 🎯",
  "Innovation is my passion! 🚀",
  "Moshi mo....!",
  "Ready to collaborate and create amazing things! 🤝",
  "Tech lover and problem solver 🧩",
  "Building tomorrow's solutions today 🌐",
  "Code, learn, repeat! 🔄"
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateGithubUsername(firstName, lastName) {
  const variations = [
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`,
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`
  ];
  return getRandomElement(variations);
}

function generateLinkedInUsername(firstName, lastName) {
  const variations = [
    `${firstName}-${lastName}`,
    `${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
    `${firstName}-${lastName}-${Math.floor(Math.random() * 1000)}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`
  ];
  return getRandomElement(variations);
}

function generateFakeUser() {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const fullName = `${firstName} ${lastName}`;
  const branch = getRandomElement(branches);
  const year = getRandomElement(years);
  const college = getRandomElement(colleges);
  
  // Generate 3-7 random skills
  const userSkills = getRandomElements(skills, Math.floor(Math.random() * 5) + 3);
  
  // Generate 2-5 random interests
  const userInterests = getRandomElements(interests, Math.floor(Math.random() * 4) + 2);
  
  const bio = getRandomElement(bioTemplates);
  const github = generateGithubUsername(firstName, lastName);
  const linkedin = generateLinkedInUsername(firstName, lastName);
  
  const now = admin.firestore.Timestamp.now();
  
  return {
    bio,
    branch,
    college,
    createdAt: now,
    fullName,
    github,
    interests: userInterests,
    linkedin,
    photoURL: null, // You can add profile picture URLs here if needed
    profileComplete: true,
    skills: userSkills,
    updatedAt: now,
    year,
    // Additional fields that might be useful
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${college.toLowerCase().replace(/\s+/g, '')}.edu`,
    displayName: fullName,
    isActive: true,
    lastSeen: now
  };
}

async function seedUsers() {
  try {
    console.log('🌱 Starting to seed test users...');
    
    const batch = db.batch();
    const users = [];
    
    // Generate 30 fake users
    for (let i = 0; i < 30; i++) {
      const userData = generateFakeUser();
      const userId = `test_user_${i + 1}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Add user to batch
      const userRef = db.collection('users').doc(userId);
      batch.set(userRef, userData);
      
      users.push({ id: userId, ...userData });
      
      console.log(`✅ Generated user ${i + 1}/30: ${userData.fullName} (${userData.branch}, ${userData.year} year)`);
    }
    
    // Commit the batch
    await batch.commit();
    
    console.log('\n🎉 Successfully seeded 30 test users to Firestore!');
    console.log('\n📊 Summary:');
    console.log(`Total users created: ${users.length}`);
    
    // Show some statistics
    const branchCount = {};
    const yearCount = {};
    
    users.forEach(user => {
      branchCount[user.branch] = (branchCount[user.branch] || 0) + 1;
      yearCount[user.year] = (yearCount[user.year] || 0) + 1;
    });
    
    console.log('\n📈 Distribution by Branch:');
    Object.entries(branchCount).forEach(([branch, count]) => {
      console.log(`  ${branch}: ${count} users`);
    });
    
    console.log('\n📈 Distribution by Year:');
    Object.entries(yearCount).forEach(([year, count]) => {
      console.log(`  ${year} year: ${count} users`);
    });
    
    console.log('\n🔧 These users can now be used for testing:');
    console.log('  - Matching/swiping functionality');
    console.log('  - Group creation and joining');
    console.log('  - Event participation');
    console.log('  - Chat and messaging');
    console.log('  - Profile browsing');
    
    console.log('\n⚠️  Note: All users have profileComplete: true, so they will appear in the main app flow.');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

// Allow running specific functions
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('\n✨ Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = {
  seedUsers,
  generateFakeUser
};