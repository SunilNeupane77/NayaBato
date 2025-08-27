// Script to check issues and verify reporter email details
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Issue = require('../models/Issue');
const User = require('../models/User');

// Load environment variables
dotenv.config();

async function connectToDB() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

async function checkReporterEmails() {
  try {
    await connectToDB();
    
    // Get all issues
    console.log('Fetching all issues...');
    const issues = await Issue.find({})
      .select('_id title reporter status')
      .lean();
    
    console.log(`Found ${issues.length} total issues`);
    
    // Group the issues by reporter
    const reporterCounts = {};
    const reporterIds = new Set();
    
    issues.forEach(issue => {
      if (issue.reporter) {
        const reporterId = issue.reporter.toString();
        reporterIds.add(reporterId);
        reporterCounts[reporterId] = (reporterCounts[reporterId] || 0) + 1;
      } else {
        console.log(`Issue ${issue._id} has no reporter assigned`);
      }
    });
    
    console.log(`Found ${reporterIds.size} unique reporters`);
    
    // Get reporter details
    const reporters = await User.find({ 
      _id: { $in: Array.from(reporterIds) } 
    }).select('_id name email role');
    
    console.log('\nReporter Details:');
    reporters.forEach(reporter => {
      const issueCount = reporterCounts[reporter._id.toString()] || 0;
      console.log(`- ${reporter.name} (${reporter.role}, ${reporter.email}) - ${issueCount} issues`);
    });
    
    // Check for issues with missing reporters
    const reportersMap = new Map(reporters.map(r => [r._id.toString(), r]));
    const missingReporters = Array.from(reporterIds).filter(id => !reportersMap.has(id));
    
    if (missingReporters.length > 0) {
      console.log('\nIssues with invalid reporter references:');
      for (const reporterId of missingReporters) {
        const brokenIssues = await Issue.find({ reporter: reporterId })
          .select('_id title status');
        
        console.log(`Reporter ID ${reporterId} (not found in Users) has ${brokenIssues.length} issues:`);
        brokenIssues.forEach(issue => {
          console.log(`  - ${issue._id} "${issue.title}" (${issue.status})`);
        });
      }
    }
    
    // Sample a few issues to verify reporter information is correctly populated
    console.log('\nSample Issues with Full Reporter Details:');
    const sampleIssues = await Issue.find({})
      .limit(5)
      .populate('reporter', 'name email role')
      .populate('assignedTo', 'name email role')
      .lean();
    
    sampleIssues.forEach(issue => {
      console.log(`Issue: ${issue._id} - "${issue.title}" (${issue.status})`);
      console.log(`  Reporter: ${issue.reporter ? 
        `${issue.reporter.name} (${issue.reporter.email})` : 
        'No reporter'}`);
      console.log(`  Assigned To: ${issue.assignedTo ? 
        `${issue.assignedTo.name} (${issue.assignedTo.email})` : 
        'Not assigned'}`);
    });
    
    console.log('\nChecking complete!');
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error checking reporter emails:', error);
  }
}

checkReporterEmails();
