// API endpoint to get a single GAA item by ID
// URL: /api/item?id=xxx

import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders } from './_cors.js';

export default async function handler(req, res) {
  // CORS headers
  setCorsHeaders(req, res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'Item ID is required' 
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Fetch item with creator details and bids
    const { data, error } = await supabase
      .from('gaa_items')
      .select(`
        *,
        creator:users (
          id,
          username,
          avatar_url,
          wallet_address
        ),
        bids (
          id,
          amount,
          created_at,
          bidder:users (
            id,
            username,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: 'Item not found' 
        });
      }
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch item' });
    }

    return res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}
