// MongoDB initialization script for Nayabato
// This script runs when the MongoDB container starts for the first time

// Switch to the nayabato database
db = db.getSiblingDB('nayabato');

// Create application user with read/write permissions
db.createUser({
  user: 'nayabato_user',
  pwd: 'nayabato_password', // Change this in production
  roles: [
    {
      role: 'readWrite',
      db: 'nayabato'
    }
  ]
});

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'name'],
      properties: {
        email: {
          bsonType: 'string',
          description: 'Email must be a string and is required'
        },
        name: {
          bsonType: 'string',
          description: 'Name must be a string and is required'
        },
        role: {
          enum: ['user', 'admin', 'moderator'],
          description: 'Role must be one of the enum values'
        }
      }
    }
  }
});

db.createCollection('issues', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'description', 'location', 'reportedBy'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'Title must be a string and is required'
        },
        description: {
          bsonType: 'string',
          description: 'Description must be a string and is required'
        },
        status: {
          enum: ['pending', 'in-progress', 'resolved', 'closed'],
          description: 'Status must be one of the enum values'
        },
        priority: {
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Priority must be one of the enum values'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.issues.createIndex({ status: 1 });
db.issues.createIndex({ priority: 1 });
db.issues.createIndex({ reportedBy: 1 });
db.issues.createIndex({ createdAt: -1 });
db.issues.createIndex({ 'location.coordinates': '2dsphere' });

db.comments.createIndex({ issueId: 1 });
db.comments.createIndex({ createdAt: -1 });

db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ read: 1 });
db.notifications.createIndex({ createdAt: -1 });

db.departments.createIndex({ name: 1 }, { unique: true });
db.departments.createIndex({ active: 1 });

// Insert default departments
db.departments.insertMany([
  {
    name: 'Public Works',
    description: 'Roads, infrastructure, and public facilities',
    email: 'publicworks@nayabato.org',
    active: true,
    createdAt: new Date()
  },
  {
    name: 'Environmental Services',
    description: 'Waste management, environmental issues',
    email: 'environment@nayabato.org',
    active: true,
    createdAt: new Date()
  },
  {
    name: 'Public Safety',
    description: 'Safety concerns and emergency issues',
    email: 'safety@nayabato.org',
    active: true,
    createdAt: new Date()
  },
  {
    name: 'Parks and Recreation',
    description: 'Parks, recreational facilities, and green spaces',
    email: 'parks@nayabato.org',
    active: true,
    createdAt: new Date()
  }
]);

print('MongoDB initialization completed for Nayabato database');
