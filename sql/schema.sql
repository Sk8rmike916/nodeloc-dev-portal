
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create the clients table for API Key Management
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    api_key CHAR(32) UNIQUE NOT NULL, -- Store the 32-character hex key
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create the core locations table
CREATE TABLE locations (
    -- user_id links to the clients table or an internal user store
    user_id INTEGER PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    -- CRITICAL: GEOGRAPHY(Point, 4326) for WGS 84 accuracy
    geopoint GEOGRAPHY(Point, 4326),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS locations_geopoint_gist_idx ON locations USING GIST (geopoint);

-- This ensures the 'geopoint' column is always calculated from lat/lon
CREATE OR REPLACE FUNCTION update_geopoint()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geopoint = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER locations_update_geopoint
BEFORE INSERT OR UPDATE OF latitude, longitude ON locations
FOR EACH ROW EXECUTE FUNCTION update_geopoint();

-- 6. API Usage Tracking Table (moved after clients and locations)
CREATE TABLE IF NOT EXISTS api_usage (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    endpoint VARCHAR(100) NOT NULL,
    request_time TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- OPTIONAL: Add an index for faster lookups when querying usage per client/endpoint
CREATE INDEX IF NOT EXISTS idx_api_usage_client_endpoint ON api_usage (client_id, endpoint);
