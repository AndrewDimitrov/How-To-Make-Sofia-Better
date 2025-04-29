module.exports = async (req, res) => {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    // Get city from query parameter
    const city = req.query.city;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }
  
    // Your API token stored as an environment variable in Vercel
    const apiToken = process.env.WAQI_API_TOKEN;
    
    try {
      // Make the API request from the server
      const response = await fetch(
        `https://api.waqi.info/feed/${city}/?token=${apiToken}`
      );
      
      // Get the data
      const data = await response.json();
      
      // Return the data to the client
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching air quality data:', error);
      return res.status(500).json({ error: 'Failed to fetch air quality data' });
    }
  }