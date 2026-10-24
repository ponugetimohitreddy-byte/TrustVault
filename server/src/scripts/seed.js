const { connectDb, disconnectDb } = require('../config/db');
const { env } = require('../config/env');
const User = require('../models/User');
const { hashPassword } = require('../utils/crypto');

async function upsertUser({ name, email, password, role, employeeId, department }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      passwordHash: await hashPassword(password),
      role,
      employeeId,
      department,
      isActive: true,
    });
    console.log(`Created ${role}: ${email}`);
  } else {
    console.log(`Exists ${role}: ${email}`);
  }
  return user;
}

async function run() {
  await connectDb();
  await upsertUser({
    name: 'System Administrator',
    email: env.seed.adminEmail,
    password: env.seed.adminPassword,
    role: 'admin',
    employeeId: 'ADM-001',
    department: 'IT',
  });
  await upsertUser({
    name: 'Alex Employee',
    email: env.seed.employeeEmail,
    password: env.seed.employeePassword,
    role: 'employee',
    employeeId: 'EMP-001',
    department: 'Operations',
  });
  await upsertUser({
    name: 'Jordan Colleague',
    email: 'jordan@company.com',
    password: 'Employee123!@#',
    role: 'employee',
    employeeId: 'EMP-002',
    department: 'Finance',
  });
  await upsertUser({
    name: 'Priya Sharma',
    email: 'priya@company.com',
    password: 'Employee123!@#',
    role: 'employee',
    employeeId: 'EMP-003',
    department: 'Human Resources',
  });
  await upsertUser({
    name: 'Sam Patel',
    email: 'sam@company.com',
    password: 'Employee123!@#',
    role: 'employee',
    employeeId: 'EMP-004',
    department: 'Legal',
  });
  await upsertUser({
    name: 'Riley Chen',
    email: 'riley@company.com',
    password: 'Employee123!@#',
    role: 'employee',
    employeeId: 'EMP-005',
    department: 'Engineering',
  });
  await upsertUser({
    name: 'Morgan Lee',
    email: 'morgan@company.com',
    password: 'Employee123!@#',
    role: 'employee',
    employeeId: 'EMP-006',
    department: 'Marketing',
  });
  await upsertUser({
    name: 'Casey Brooks',
    email: 'casey@company.com',
    password: 'Employee123!@#',
    role: 'employee',
    employeeId: 'EMP-007',
    department: 'Operations',
  });
  await upsertUser({
    name: 'System Administrator',
    email: 'mohit@company.com',
    password: '123456789',
    role: 'admin',
    employeeId: 'ADM-002',
    department: 'IT',
  });
  await disconnectDb();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
