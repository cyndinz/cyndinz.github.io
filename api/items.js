// API endpoint to get all GAA items
// URL: /api/items

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
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Get query parameters for filtering
    const { status, limit = 50, offset = 0 } = req.query;

    // Build query
    let query = supabase
      .from('gaa_items')
      .select(`
        id,
        name,
        description,
        image_url,
        price,
        currency,
        status,
        created_at,
        creator:users (
          id,
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch items' });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}
