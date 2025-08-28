// Simple keyword-based categorization (can be enhanced with actual AI)
const categoryKeywords = {
  pothole: ['pothole', 'road', 'street', 'crack', 'asphalt', 'pavement', 'hole'],
  streetlight: ['light', 'lamp', 'dark', 'bulb', 'illumination', 'lighting'],
  garbage: ['trash', 'waste', 'garbage', 'litter', 'dump', 'rubbish', 'clean'],
  water: ['water', 'leak', 'pipe', 'drainage', 'flood', 'sewage', 'tap'],
  electricity: ['power', 'electric', 'wire', 'cable', 'outage', 'transformer'],
  other: []
};

export function categorizeIssue(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const scores = {};
  
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    scores[category] = keywords.reduce((score, keyword) => {
      const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
      return score + matches;
    }, 0);
  });

  const suggestedCategory = Object.entries(scores)
    .filter(([category]) => category !== 'other')
    .sort(([,a], [,b]) => b - a)[0];

  return suggestedCategory && suggestedCategory[1] > 0 
    ? suggestedCategory[0] 
    : 'other';
}

export function calculatePriority(votes, category, location) {
  let priority = 'medium';
  
  if (votes.urgent > 5 || votes.upvotes > 20) {
    priority = 'high';
  }
  
  if (votes.urgent > 10 || votes.upvotes > 50) {
    priority = 'critical';
  }
  
  // Safety-critical categories get higher priority
  if (['streetlight', 'electricity', 'water'].includes(category)) {
    if (priority === 'medium') priority = 'high';
    if (priority === 'low') priority = 'medium';
  }
  
  return priority;
}
