// pages/api/search-address.ts
export default async function handler(req, res) {
  const { query } = req.query;
  if (!query) return res.status(400).json({ suggestions: [] });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&language=el&key=${process.env.NEXT_PUBLIC_GEOLOCATION_API}&types=address`
  );
  const data = await response.json();

  const suggestions = data.predictions.map((p) => p.description);
  res.status(200).json({ suggestions });
}
