/*
  # Community Pets and Matches System

  ## Overview
  Creates tables for community pet discovery, matching, and messaging functionality.

  ## New Tables
  
  ### 1. `community_pets`
  Stores pet profiles available for community discovery (playdates/mating)
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `name` (text) - Pet name
  - `breed` (text) - Pet breed
  - `species` (text) - Dog, Cat, etc.
  - `age` (integer) - Age in years
  - `gender` (text) - Male/Female
  - `energy_level` (text) - Low/Medium/High
  - `status` (text) - Intact/Neutered
  - `bio` (text) - Pet description
  - `image_url` (text) - Profile image
  - `tags` (text array) - Temperament tags
  - `medical_history` (text array) - Medical info
  - `latitude` (numeric) - Location latitude
  - `longitude` (numeric) - Location longitude
  - `location_name` (text) - Human-readable location
  - `available_for_play` (boolean) - Available for playdates
  - `available_for_mating` (boolean) - Available for breeding
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `pet_matches`
  Stores matches between pets
  - `id` (uuid, primary key) - Unique identifier
  - `pet1_id` (uuid, foreign key) - First pet in match
  - `pet2_id` (uuid, foreign key) - Second pet in match
  - `user1_id` (uuid) - Owner of pet1
  - `user2_id` (uuid) - Owner of pet2
  - `match_type` (text) - 'play' or 'mate'
  - `status` (text) - 'pending', 'accepted', 'rejected'
  - `initiated_by` (uuid) - User who initiated
  - `message` (text) - Initial message
  - `created_at` (timestamptz) - Match timestamp

  ### 3. `match_messages`
  Stores messages between matched users
  - `id` (uuid, primary key) - Unique identifier
  - `match_id` (uuid, foreign key) - References pet_matches
  - `sender_id` (uuid) - User who sent message
  - `message` (text) - Message content
  - `created_at` (timestamptz) - Message timestamp

  ## Security
  - Row Level Security enabled on all tables
  - Users can read all community pets
  - Users can only create/update their own community pets
  - Users can only see matches they're part of
  - Users can only send messages in their matches

  ## Important Notes
  - Uses PostGIS extension for location-based queries
  - Latitude/longitude stored as numeric for distance calculations
  - Default values ensure data integrity
*/

-- Enable PostGIS extension for location queries (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Community Pets Table
CREATE TABLE IF NOT EXISTS community_pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  breed text NOT NULL,
  species text DEFAULT 'Dog' NOT NULL,
  age integer DEFAULT 1 NOT NULL,
  gender text DEFAULT 'Male' NOT NULL,
  energy_level text DEFAULT 'Medium' NOT NULL,
  status text DEFAULT 'Intact' NOT NULL,
  bio text DEFAULT '',
  image_url text DEFAULT '',
  tags text[] DEFAULT '{}',
  medical_history text[] DEFAULT '{}',
  latitude numeric,
  longitude numeric,
  location_name text DEFAULT '',
  available_for_play boolean DEFAULT true,
  available_for_mating boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pet Matches Table
CREATE TABLE IF NOT EXISTS pet_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet1_id uuid REFERENCES community_pets(id) ON DELETE CASCADE NOT NULL,
  pet2_id uuid REFERENCES community_pets(id) ON DELETE CASCADE NOT NULL,
  user1_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_type text DEFAULT 'play' NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  initiated_by uuid REFERENCES auth.users(id) NOT NULL,
  message text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(pet1_id, pet2_id, match_type)
);

-- Match Messages Table
CREATE TABLE IF NOT EXISTS match_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES pet_matches(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_community_pets_user_id ON community_pets(user_id);
CREATE INDEX IF NOT EXISTS idx_community_pets_location ON community_pets(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_community_pets_available_play ON community_pets(available_for_play);
CREATE INDEX IF NOT EXISTS idx_community_pets_available_mating ON community_pets(available_for_mating);
CREATE INDEX IF NOT EXISTS idx_pet_matches_users ON pet_matches(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_match_messages_match_id ON match_messages(match_id);

-- Enable Row Level Security
ALTER TABLE community_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_pets

-- Anyone can view community pets
CREATE POLICY "Anyone can view community pets"
  ON community_pets FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own community pets
CREATE POLICY "Users can create own community pets"
  ON community_pets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own community pets
CREATE POLICY "Users can update own community pets"
  ON community_pets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own community pets
CREATE POLICY "Users can delete own community pets"
  ON community_pets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for pet_matches

-- Users can view matches they're part of
CREATE POLICY "Users can view their matches"
  ON pet_matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can create matches with their pets
CREATE POLICY "Users can create matches"
  ON pet_matches FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = initiated_by AND
    (auth.uid() = user1_id OR auth.uid() = user2_id)
  );

-- Users can update status of matches they're part of
CREATE POLICY "Users can update their matches"
  ON pet_matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id)
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS Policies for match_messages

-- Users can view messages in their matches
CREATE POLICY "Users can view messages in their matches"
  ON match_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pet_matches
      WHERE pet_matches.id = match_messages.match_id
      AND (pet_matches.user1_id = auth.uid() OR pet_matches.user2_id = auth.uid())
    )
  );

-- Users can send messages in their matches
CREATE POLICY "Users can send messages in their matches"
  ON match_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM pet_matches
      WHERE pet_matches.id = match_messages.match_id
      AND (pet_matches.user1_id = auth.uid() OR pet_matches.user2_id = auth.uid())
    )
  );

-- Function to calculate distance between two points (in kilometers)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
)
RETURNS numeric AS $$
DECLARE
  r numeric := 6371; -- Earth's radius in kilometers
  dlat numeric;
  dlon numeric;
  a numeric;
  c numeric;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
