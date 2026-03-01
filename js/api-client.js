// GAA Marketplace - Frontend API Client
// This file handles all communication between frontend and Vercel backend

// TODO: Replace with your actual Vercel deployment URL after deploying to Vercel
const API_URL = 'https://gaafree.vercel.app/api';


/**
 * Fetch all GAA items
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by status ('active', 'sold', 'inactive')
 * @param {number} options.limit - Number of items to fetch (default: 50)
 * @param {number} options.offset - Pagination offset (default: 0)
 * @returns {Promise<Array>} Array of GAA items
 */
async function fetchGAAItems(options = {}) {
  try {
    const params = new URLSearchParams();
    if (options.status) params.append('status', options.status);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);

    const url = `${API_URL}/items${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Error fetching GAA items:', error);
    return [];
  }
}

/**
 * Fetch a single GAA item by ID
 * @param {string} id - Item UUID
 * @returns {Promise<Object|null>} Item object or null
 */
async function fetchGAAItem(id) {
  try {
    const response = await fetch(`${API_URL}/item?id=${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching GAA item:', error);
    return null;
  }
}

/**
 * Fetch bids for a specific item
 * @param {string} itemId - Item UUID
 * @returns {Promise<Array>} Array of bids
 */
async function fetchBids(itemId) {
  try {
    const response = await fetch(`${API_URL}/bids?item_id=${itemId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Error fetching bids:', error);
    return [];
  }
}

/**
 * Place a bid on a GAA item
 * @param {string} itemId - Item UUID
 * @param {number} amount - Bid amount in FREE tokens
 * @param {string} bidderId - Bidder's user UUID
 * @returns {Promise<Object>} Result object with success status
 */
async function placeBid(itemId, amount, bidderId) {
  try {
    const response = await fetch(`${API_URL}/bids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        item_id: itemId,
        amount: parseFloat(amount),
        bidder_id: bidderId
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error placing bid:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Fetch user profile
 * @param {Object} options - Query options
 * @param {string} options.id - User UUID
 * @param {string} options.username - Username
 * @returns {Promise<Object|null>} User object or null
 */
async function fetchUser(options = {}) {
  try {
    const params = new URLSearchParams();
    if (options.id) params.append('id', options.id);
    if (options.username) params.append('username', options.username);

    const response = await fetch(`${API_URL}/users?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Update user profile
 * @param {string} userId - User UUID
 * @param {Object} updates - Fields to update
 * @param {string} updates.username - New username
 * @param {string} updates.bio - New bio
 * @param {string} updates.avatar_url - New avatar URL
 * @returns {Promise<Object>} Result object with success status
 */
async function updateUser(userId, updates) {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: userId,
        ...updates
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating user:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Example usage:
/*
document.addEventListener('DOMContentLoaded', async () => {
  // Load all active GAA items
  const items = await fetchGAAItems({ status: 'active', limit: 10 });
  console.log('GAA Items:', items);
  
  // Load a specific item
  if (items.length > 0) {
    const item = await fetchGAAItem(items[0].id);
    console.log('Item details:', item);
    
    // Load bids for this item
    const bids = await fetchBids(item.id);
    console.log('Bids:', bids);
  }
  
  // Load user profile
  const user = await fetchUser({ username: 'Cinderella' });
  console.log('User:', user);
});
*/
