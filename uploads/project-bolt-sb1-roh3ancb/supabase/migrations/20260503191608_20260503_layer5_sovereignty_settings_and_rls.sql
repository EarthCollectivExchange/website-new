/*
  # Layer 5: Sovereignty Settings + Auth Bridge Support

  ## Summary
  Adds server-side storage for per-conversation and per-user sovereignty settings
  so they can survive device switches and be kept in sync when the user is authenticated.
  Also adds upsert-friendly RLS policies for earth_ids to support the auth bridge
  (create-or-fetch EarthID on first sign-in).

  ## New Tables

  ### conversation_sovereignty_settings
  Stores per-conversation QLPA settings (storage mode, trust level, consent toggles,
  safety flags). Owned by the EarthID that controls the conversation slot.
  - conversation_id — links to conversations
  - earth_id        — the owning EarthID
  - storage_mode, trust_level
  - consent: allow_direct_messages, require_approval, allow_project_invites,
             allow_event_invites, allow_location_messages
  - safety: is_muted, is_blocked
  - updated_at

  ### user_sovereignty_settings
  Stores per-user Intention Mirror configuration. One row per EarthID.
  - earth_id (unique)
  - intention_mirror — JSONB blob matching the IntentionMirror type
  - updated_at

  ## Security
  - RLS enabled on both tables
  - Only the owning authenticated user can read/write their own rows
  - earth_ids: add INSERT policy so the auth bridge can create a new EarthID on
    first sign-in; add SELECT policy so users can read their own row
*/

-- ─── conversation_sovereignty_settings ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversation_sovereignty_settings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id         uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  earth_id                uuid NOT NULL REFERENCES earth_ids(id) ON DELETE CASCADE,
  storage_mode            text NOT NULL DEFAULT 'encrypted_relay'
                            CHECK (storage_mode = ANY (ARRAY['local_only','encrypted_relay','encrypted_backup'])),
  trust_level             text NOT NULL DEFAULT 'unknown'
                            CHECK (trust_level = ANY (ARRAY['self','trusted','known','community','unknown','blocked'])),
  allow_direct_messages   boolean NOT NULL DEFAULT true,
  require_approval        boolean NOT NULL DEFAULT false,
  allow_project_invites   boolean NOT NULL DEFAULT true,
  allow_event_invites     boolean NOT NULL DEFAULT true,
  allow_location_messages boolean NOT NULL DEFAULT false,
  is_muted                boolean NOT NULL DEFAULT false,
  is_blocked              boolean NOT NULL DEFAULT false,
  updated_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, earth_id)
);

ALTER TABLE conversation_sovereignty_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select own conversation sovereignty settings"
  ON conversation_sovereignty_settings FOR SELECT
  TO authenticated
  USING (
    earth_id IN (
      SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Owner can insert own conversation sovereignty settings"
  ON conversation_sovereignty_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    earth_id IN (
      SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Owner can update own conversation sovereignty settings"
  ON conversation_sovereignty_settings FOR UPDATE
  TO authenticated
  USING (
    earth_id IN (
      SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    earth_id IN (
      SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()
    )
  );

-- ─── user_sovereignty_settings ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_sovereignty_settings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  earth_id            uuid NOT NULL UNIQUE REFERENCES earth_ids(id) ON DELETE CASCADE,
  intention_mirror    jsonb NOT NULL DEFAULT '{
    "enabled": true,
    "checkBeforeSending": true,
    "toneReflection": true,
    "harmfulPatternWarning": true,
    "userCanOverride": true,
    "reflectionMode": "soft"
  }'::jsonb,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_sovereignty_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select own user sovereignty settings"
  ON user_sovereignty_settings FOR SELECT
  TO authenticated
  USING (
    earth_id IN (
      SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Owner can insert own user sovereignty settings"
  ON user_sovereignty_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    earth_id IN (
      SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Owner can update own user sovereignty settings"
  ON user_sovereignty_settings FOR UPDATE
  TO authenticated
  USING (
    earth_id IN (
      SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    earth_id IN (
      SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()
    )
  );

-- ─── earth_ids: auth bridge policies ──────────────────────────────────────────

-- Allow authenticated users to read their own EarthID row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'earth_ids' AND policyname = 'User can select own EarthID'
  ) THEN
    CREATE POLICY "User can select own EarthID"
      ON earth_ids FOR SELECT
      TO authenticated
      USING (auth_user_id = auth.uid());
  END IF;
END $$;

-- Allow authenticated users to insert their own EarthID (auth bridge: first sign-in)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'earth_ids' AND policyname = 'User can insert own EarthID'
  ) THEN
    CREATE POLICY "User can insert own EarthID"
      ON earth_ids FOR INSERT
      TO authenticated
      WITH CHECK (auth_user_id = auth.uid());
  END IF;
END $$;

-- Allow authenticated users to update their own EarthID
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'earth_ids' AND policyname = 'User can update own EarthID'
  ) THEN
    CREATE POLICY "User can update own EarthID"
      ON earth_ids FOR UPDATE
      TO authenticated
      USING (auth_user_id = auth.uid())
      WITH CHECK (auth_user_id = auth.uid());
  END IF;
END $$;

-- ─── conversations: insert policy for authenticated users ─────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'conversations' AND policyname = 'Member can insert conversation'
  ) THEN
    CREATE POLICY "Member can insert conversation"
      ON conversations FOR INSERT
      TO authenticated
      WITH CHECK (
        created_by_earth_id IN (
          SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── conversation_members: RLS policies ──────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'conversation_members' AND policyname = 'Member can select own memberships'
  ) THEN
    CREATE POLICY "Member can select own memberships"
      ON conversation_members FOR SELECT
      TO authenticated
      USING (
        earth_id IN (
          SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'conversation_members' AND policyname = 'Member can insert own membership'
  ) THEN
    CREATE POLICY "Member can insert own membership"
      ON conversation_members FOR INSERT
      TO authenticated
      WITH CHECK (
        earth_id IN (
          SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── ledger_events: insert policy ─────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ledger_events' AND policyname = 'User can insert own ledger events'
  ) THEN
    CREATE POLICY "User can insert own ledger events"
      ON ledger_events FOR INSERT
      TO authenticated
      WITH CHECK (
        earth_id IN (
          SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ledger_events' AND policyname = 'User can select own ledger events'
  ) THEN
    CREATE POLICY "User can select own ledger events"
      ON ledger_events FOR SELECT
      TO authenticated
      USING (
        earth_id IN (
          SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;
