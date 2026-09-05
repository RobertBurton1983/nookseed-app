// GET /api/local-matches?query=pottery+studio&location=Portland,+OR
// Looks up real nearby places (studios, clubs, classes) via Google's Places API.
// Only called after payment is verified (see public/index.html).
// Requires env var GOOGLE_PLACES_API_KEY with the Places API (New) enabled.

module.exports = async (req, res) => {
  const { query, location } = req.query;
  if (!query || !location) {
    return res.status(400).json({ error: 'Missing query or location' });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Places API is not configured yet' });
  }

  const textQuery = `${query} near ${location}`;

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // Field mask keeps the response small and keeps you on the cheaper
        // Places API pricing tier — only ask for fields you actually use.
        'X-Goog-FieldMask': [
          'places.displayName',
          'places.formattedAddress',
          'places.rating',
          'places.userRatingCount',
          'places.googleMapsUri',
          'places.websiteUri',
        ].join(','),
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: 5,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Places API error:', errText);
      return res.status(502).json({ error: 'Local search failed' });
    }

    const data = await response.json();
    const places = (data.places || []).map((p) => ({
      name: p.displayName ? p.displayName.text : 'Unnamed place',
      address: p.formattedAddress || '',
      rating: p.rating || null,
      ratingCount: p.userRatingCount || 0,
      mapsUrl: p.googleMapsUri || null,
      website: p.websiteUri || null,
    }));

    res.status(200).json({ places });
  } catch (err) {
    console.error('local-matches error:', err);
    res.status(500).json({ error: 'Local search failed' });
  }
};
