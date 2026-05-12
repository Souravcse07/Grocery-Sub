const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const startBillingJob = require('../jobs/billing.job');
const startSlotGeneratorJob = require('../jobs/slotGenerator.job');
const startSeasonAlertJob = require('../jobs/seasonAlert.job');
const connectDB = require('../config/db');

async function runTest() {
  await connectDB();
  console.log("DB Connected. Starting jobs manually for testing...");
  
  // Just start them to ensure no syntax errors
  startBillingJob();
  startSlotGeneratorJob();
  startSeasonAlertJob();
  
  console.log("All jobs initialized without errors.");
  process.exit(0);
}

runTest();
