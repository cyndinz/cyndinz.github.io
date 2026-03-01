// API endpoint to handle bids on GAA items
// URL: /api/bids

import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders } from './_cors.js';

export default async function handler(req, res) {
  // CORS headers
  setCorsHeaders(req, res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // GET: Fetch bids for an item
    if (req.method === 'GET') {
      const { item_id } = req.query;

      if (!item_id) {
        return res.status(400).json({ 
          success: false,
          error: 'Item ID is required' 
        });
      }

      const { data, error } = await supabase
        .from('bids')
        .select(`
          id,
          amount,
          created_at,
          bidder:users (
            id,
            username,
            avatar_url
          )
        `)
        .eq('item_id', item_id)
        .order('amount', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to fetch bids' });
      }

      return res.status(200).json({
        success: true,
        data: data || []
      });
    }

    // POST: Create a new bid
    if (req.method === 'POST') {
      const { item_id, amount, bidder_id } = req.body;

      // Validation
      if (!item_id || !amount || !bidder_id) {
        return res.status(400).json({ 
          success: false,
          error: 'Missing required fields: item_id, amount, bidder_id' 
        });
      }

      if (amount <= 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Bid amount must be greater than 0' 
        });
      }

      // Check if item exists
      const { data: item } = await supabase
        .from('gaa_items')
        .select('id, price, status')
        .eq('id', item_id)
        .single();

      if (!item) {
        return res.status(404).json({ 
          success: false,
          error: 'Item not found' 
        });
      }

      if (item.status !== 'active') {
        return res.status(400).json({ 
          success: false,
          error: 'Item is not available for bidding' 
        });
      }

      // Get highest bid
      const { data: highestBid } = await supabase
        .from('bids')
        .select('amount')
        .eq('item_id', item_id)
        .order('amount', { ascending: false })
        .limit(1)
        .single();

      const minimumBid = highestBid ? highestBid.amount : item.price;

      if (amount <= minimumBid) {
        return res.status(400).json({ 
          success: false,
          error: `Bid must be higher than ${minimumBid} FREE` 
        });
      }

      // Insert bid
      const { data: newBid, error } = await supabase
        .from('bids')
        .insert({
          item_id,
          bidder_id,
          amount
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to place bid' 
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Bid placed successfully',
        data: newBid
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}
