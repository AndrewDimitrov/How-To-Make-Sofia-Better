module.exports = async (req, res) => {
  const { city } = req.query;
  const token = process.env.API_TOKEN;

  const apiUrl = `https://api.waqi.info/feed/${city}/?token=${token}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};
