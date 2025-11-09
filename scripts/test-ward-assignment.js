/**
 * Test script for Haversine-based ward assignment
 * Run with: node scripts/test-ward-assignment.js
 */

import { haversineDistance, findWardsWithinRadius, formatDistance } from '../lib/location-utils.js';

// Sample ward data for testing
const sampleWards = [
  {
    name: 'Ward 1',
    number: 1,
    location: {
      coordinates: {
        coordinates: [85.3240, 27.7172] // Kathmandu center
      }
    }
  },
  {
    name: 'Ward 2', 
    number: 2,
    location: {
      coordinates: {
        coordinates: [85.3340, 27.7272] // ~1.5km northeast
      }
    }
  },
  {
    name: 'Ward 3',
    number: 3,
    location: {
      coordinates: {
        coordinates: [85.3140, 27.7072] // ~1.5km southwest
      }
    }
  }
];

// Test coordinates (near Ward 1)
const testCoordinates = [85.3250, 27.7180];

console.log('🧪 Testing Haversine Ward Assignment\n');

console.log('Test Coordinates:', testCoordinates);
console.log('Available Wards:', sampleWards.length);
console.log('');

// Test distance calculations
console.log('📏 Distance Calculations:');
sampleWards.forEach(ward => {
  const distance = haversineDistance(testCoordinates, ward.location.coordinates.coordinates);
  console.log(`  ${ward.name}: ${formatDistance(distance)}`);
});

console.log('');

// Test finding wards within radius
console.log('🎯 Wards within 2km radius:');
const nearbyWards = findWardsWithinRadius(
  testCoordinates, 
  sampleWards.map(ward => ({
    ...ward,
    location: {
      coordinates: ward.location.coordinates.coordinates
    }
  })), 
  2000
);
nearbyWards.forEach(({ ward, distance }) => {
  console.log(`  ${ward.name}: ${formatDistance(distance)}`);
});

console.log('');

// Test nearest ward selection
const nearest = nearbyWards[0];
if (nearest) {
  console.log('✅ Nearest Ward Assignment:');
  console.log(`  Ward: ${nearest.ward.name} (#${nearest.ward.number})`);
  console.log(`  Distance: ${formatDistance(nearest.distance)}`);
} else {
  console.log('❌ No ward found within radius');
}

console.log('\n🎉 Test completed successfully!');
