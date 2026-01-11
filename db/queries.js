// geo-match-service/db/queries.js

// 1. UPSERT (Insert or Update) for client location
// Uses PostGIS ST_MakePoint and ST_SetSRID for WGS 84 accuracy
const UPSERT_LOCATION = `
  INSERT INTO locations (user_id, latitude, longitude)
  VALUES ($1, $2, $3)
  ON CONFLICT (user_id) DO UPDATE
  SET latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      last_updated = NOW()
  RETURNING user_id;
`;

// 2. FIND NEARBY (Read/Query) based on proximity
// $1: target longitude, $2: target latitude, $3: radius in meters, $4: limit
const FIND_NEARBY = `
  SELECT user_id, latitude, longitude,
         ST_Distance(geopoint, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance_meters
  FROM locations
  WHERE ST_DWithin(geopoint, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
  ORDER BY distance_meters
  LIMIT $4;
`;

module.exports = {
  UPSERT_LOCATION,
  FIND_NEARBY
};