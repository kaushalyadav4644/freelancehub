const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Job = require('./models/Job');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freelance_marketplace');
  console.log('Connected to MongoDB...');

  // Clear existing data
  await Promise.all([User.deleteMany(), Job.deleteMany()]);
  console.log('Cleared existing data...');

  // Create users
  const adminUser = await User.create({
    name: 'Admin User', email: 'admin@demo.com', password: 'password123',
    role: 'admin', isVerified: true, isActive: true, bio: 'Platform administrator',
  });

  const client1 = await User.create({
    name: 'Sarah Johnson', email: 'client@demo.com', password: 'password123',
    role: 'client', isVerified: true, location: 'New York, USA',
    bio: 'Tech startup founder looking for talented developers and designers.',
    totalSpent: 8500,
  });

  const client2 = await User.create({
    name: 'Mike Wilson', email: 'client2@demo.com', password: 'password123',
    role: 'client', isVerified: true, location: 'London, UK',
    bio: 'E-commerce entrepreneur scaling my business.',
    totalSpent: 3200,
  });

  const freelancer1 = await User.create({
    name: 'Alex Chen', email: 'freelancer@demo.com', password: 'password123',
    role: 'freelancer', isVerified: true, location: 'San Francisco, USA',
    bio: 'Full-stack developer with 5+ years building React and Node.js applications. Passionate about clean code and great UX.',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'GraphQL', 'AWS'],
    hourlyRate: 85, experience: 'expert', rating: 4.8, reviewCount: 24, completedJobs: 31, totalEarnings: 45000,
    portfolio: [
      { title: 'SaaS Dashboard', description: 'Built a complete analytics dashboard for a fintech startup', link: 'https://github.com' },
      { title: 'E-commerce Platform', description: 'Full-stack e-commerce solution with Stripe payments', link: 'https://github.com' },
    ],
  });

  const freelancer2 = await User.create({
    name: 'Priya Patel', email: 'freelancer2@demo.com', password: 'password123',
    role: 'freelancer', isVerified: true, location: 'Bangalore, India',
    bio: 'UI/UX designer and frontend developer. I create beautiful, user-centric interfaces that convert.',
    skills: ['Figma', 'React', 'Tailwind CSS', 'UI/UX', 'Framer Motion'],
    hourlyRate: 65, experience: 'intermediate', rating: 4.6, reviewCount: 18, completedJobs: 22, totalEarnings: 28000,
  });

  const freelancer3 = await User.create({
    name: 'James O\'Brien', email: 'freelancer3@demo.com', password: 'password123',
    role: 'freelancer', isVerified: false, location: 'Dublin, Ireland',
    bio: 'Mobile app developer specializing in React Native. Built 15+ apps on iOS and Android.',
    skills: ['React Native', 'iOS', 'Android', 'Firebase', 'Redux'],
    hourlyRate: 75, experience: 'expert', rating: 4.5, reviewCount: 12, completedJobs: 15, totalEarnings: 32000,
  });

  console.log('Created users...');

  // Create jobs
  const jobs = await Job.insertMany([
    {
      title: 'Build a React Dashboard for SaaS Analytics Platform',
      description: 'We need an experienced React developer to build a comprehensive analytics dashboard. The dashboard should include interactive charts, data tables, real-time updates via WebSocket, and a clean, modern UI. Must integrate with our existing REST API.',
      category: 'web-development',
      skills: ['React', 'TypeScript', 'Chart.js', 'WebSocket', 'Tailwind CSS'],
      budget: { type: 'fixed', min: 2000, max: 4000 },
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      clientId: client1._id,
      status: 'open',
      experienceLevel: 'expert',
      duration: '1-3-months',
      applicationsCount: 5,
    },
    {
      title: 'Design UI/UX for Mobile Banking App',
      description: 'Looking for a talented UI/UX designer to create wireframes, prototypes, and final designs for our mobile banking application. The app needs to be intuitive, secure-looking, and modern. Deliverables include Figma file with all screens and a design system.',
      category: 'design',
      skills: ['Figma', 'UI/UX', 'Mobile Design', 'Prototyping'],
      budget: { type: 'fixed', min: 1500, max: 3000 },
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      clientId: client1._id,
      status: 'open',
      experienceLevel: 'intermediate',
      duration: '1-3-months',
      applicationsCount: 3,
    },
    {
      title: 'React Native Mobile App for Food Delivery',
      description: 'Build a cross-platform food delivery app similar to Uber Eats. Features include: user authentication, restaurant browsing, cart management, real-time order tracking, push notifications, and Stripe payment integration.',
      category: 'mobile-development',
      skills: ['React Native', 'Firebase', 'Redux', 'Stripe', 'Maps API'],
      budget: { type: 'fixed', min: 5000, max: 8000 },
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      clientId: client2._id,
      status: 'open',
      experienceLevel: 'expert',
      duration: '3-6-months',
      applicationsCount: 7,
    },
    {
      title: 'SEO Copywriter for Tech Blog (10 Articles)',
      description: 'We need a skilled copywriter to create 10 SEO-optimized blog articles for our software company. Topics will be provided. Each article should be 1500-2000 words, properly structured with headings, and target specific keywords.',
      category: 'writing',
      skills: ['SEO', 'Copywriting', 'Technical Writing', 'Content Strategy'],
      budget: { type: 'fixed', min: 500, max: 800 },
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      clientId: client2._id,
      status: 'open',
      experienceLevel: 'intermediate',
      duration: 'less-than-1-month',
      applicationsCount: 12,
    },
    {
      title: 'Node.js Backend Developer for E-commerce API',
      description: 'Looking for a Node.js developer to build a scalable REST API for our e-commerce platform. Requirements: Express.js, MongoDB, JWT auth, product management, order processing, inventory management, and Stripe integration.',
      category: 'web-development',
      skills: ['Node.js', 'Express.js', 'MongoDB', 'JWT', 'Stripe', 'REST API'],
      budget: { type: 'hourly', min: 60, max: 90 },
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      clientId: client1._id,
      status: 'open',
      experienceLevel: 'intermediate',
      duration: '1-3-months',
      applicationsCount: 4,
    },
    {
      title: 'Python Data Scientist for ML Pipeline',
      description: 'We are looking for a data scientist to help us build a machine learning pipeline for customer churn prediction. Experience with scikit-learn, pandas, and model deployment required. Nice to have: experience with AWS SageMaker.',
      category: 'data-science',
      skills: ['Python', 'Machine Learning', 'scikit-learn', 'pandas', 'AWS'],
      budget: { type: 'hourly', min: 80, max: 120 },
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      clientId: client2._id,
      status: 'open',
      experienceLevel: 'expert',
      duration: '3-6-months',
      applicationsCount: 2,
    },
  ]);

  console.log('Created jobs...');
  console.log('\n✅ Seed complete! Demo accounts:');
  console.log('   admin@demo.com / password123 (Admin)');
  console.log('   client@demo.com / password123 (Client)');
  console.log('   client2@demo.com / password123 (Client)');
  console.log('   freelancer@demo.com / password123 (Freelancer)');
  console.log('   freelancer2@demo.com / password123 (Freelancer)');
  console.log('   freelancer3@demo.com / password123 (Freelancer)');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
