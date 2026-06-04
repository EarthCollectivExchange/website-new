/*
  # EarthOS File Transfer Tables

  Implements the three-tier file transfer system (local_only / encrypted_relay / encrypted_vault).

  ## New Tables

  1. `file_transfers` — One record per file send attempt. Holds encrypted metadata only.
     No plaintext filename, MIME type, or file content is ever stored here.
     - id, conversation_id, sender_earth_id, storage_mode, status
     - file_name_encrypted, mime_type_encrypted (AES-GCM encrypted, base64)
     - size_bytes, chunk_count, encryption_status, integrity_hash
     - retention_policy, created_at, expires_at, updated_at

  2. `file_permissions` — Controls which recipients can download a file.
     Created before the cross-referencing policy on file_transfers.
     - id, file_transfer_id, recipient_earth_id, can_download, downloaded_at, granted_at

  3. `file_chunks` — Metadata for each encrypted chunk stored in object storage (R2).
     Chunk content itself is never stored in Postgres.
     - id, file_transfer_id, chunk_index, object_key, size_bytes, chunk_hash, uploaded_at

  4. `file_delivery_events` — Audit trail per participant action (download, expire, delete).
     - id, file_transfer_id, earth_id, event_type, detail, chunk_index, created_at

  5. `file_retention_policies` — Tracks expiry and deletion state per transfer.
     - file_transfer_id (PK), policy, expires_at, deleted_at, created_at, updated_at

  ## Security

  - RLS enabled on all 5 tables
  - Senders can see/manage their own records
  - Recipients can only see transfers they have permission for (via file_permissions)
  - No USING (true) policies — all checks use auth.uid() via earth_ids join
  - Separate SELECT / INSERT / UPDATE policies per actor role

  ## Privacy Invariants

  - file_name_encrypted and mime_type_encrypted hold AES-GCM ciphertext only
  - Plaintext filenames and MIME types are NEVER stored server-side
  - local_only transfers never create rows in this table
*/

-- ─── file_transfers ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS file_transfers (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     uuid        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_earth_id     uuid        NOT NULL REFERENCES earth_ids(id) ON DELETE CASCADE,
  storage_mode        text        NOT NULL CHECK (storage_mode IN ('local_only','encrypted_relay','encrypted_vault')),
  status              text        NOT NULL DEFAULT 'pending_local'
                                  CHECK (status IN ('pending_local','encrypting','uploading','ready','downloading','delivered','expired','failed','local_only')),
  file_name_encrypted text,
  mime_type_encrypted text,
  size_bytes          bigint      NOT NULL DEFAULT 0,
  chunk_count         integer     NOT NULL DEFAULT 1,
  encryption_status   text        NOT NULL DEFAULT 'pending' CHECK (encryption_status IN ('pending','encrypted','failed')),
  integrity_hash      text        NOT NULL DEFAULT '',
  retention_policy    text        NOT NULL DEFAULT '7d'
                                  CHECK (retention_policy IN ('after_download','24h','7d','30d','manual')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  expires_at          timestamptz,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE file_transfers ENABLE ROW LEVEL SECURITY;

-- ─── file_permissions ────────────────────────────────────────────────────────
-- Created before cross-referencing policy on file_transfers

CREATE TABLE IF NOT EXISTS file_permissions (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  file_transfer_id   uuid        NOT NULL REFERENCES file_transfers(id) ON DELETE CASCADE,
  recipient_earth_id uuid        NOT NULL REFERENCES earth_ids(id) ON DELETE CASCADE,
  can_download       boolean     NOT NULL DEFAULT false,
  downloaded_at      timestamptz,
  granted_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (file_transfer_id, recipient_earth_id)
);

ALTER TABLE file_permissions ENABLE ROW LEVEL SECURITY;

-- ─── file_transfers RLS policies ─────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_transfers' AND policyname = 'Sender can view own file transfers') THEN
    CREATE POLICY "Sender can view own file transfers"
      ON file_transfers FOR SELECT TO authenticated
      USING (sender_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_transfers' AND policyname = 'Sender can insert file transfers') THEN
    CREATE POLICY "Sender can insert file transfers"
      ON file_transfers FOR INSERT TO authenticated
      WITH CHECK (sender_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_transfers' AND policyname = 'Sender can update own file transfers') THEN
    CREATE POLICY "Sender can update own file transfers"
      ON file_transfers FOR UPDATE TO authenticated
      USING (sender_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()))
      WITH CHECK (sender_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_transfers' AND policyname = 'Recipients can view permitted file transfers') THEN
    CREATE POLICY "Recipients can view permitted file transfers"
      ON file_transfers FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM file_permissions fp
          JOIN earth_ids ei ON ei.id = fp.recipient_earth_id
          WHERE fp.file_transfer_id = file_transfers.id
            AND ei.auth_user_id = auth.uid()
            AND fp.can_download = true
        )
      );
  END IF;
END $$;

-- ─── file_permissions RLS policies ───────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_permissions' AND policyname = 'Sender can view own file permissions') THEN
    CREATE POLICY "Sender can view own file permissions"
      ON file_permissions FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM file_transfers ft
          JOIN earth_ids ei ON ei.id = ft.sender_earth_id
          WHERE ft.id = file_permissions.file_transfer_id AND ei.auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_permissions' AND policyname = 'Sender can insert file permissions') THEN
    CREATE POLICY "Sender can insert file permissions"
      ON file_permissions FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM file_transfers ft
          JOIN earth_ids ei ON ei.id = ft.sender_earth_id
          WHERE ft.id = file_permissions.file_transfer_id AND ei.auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_permissions' AND policyname = 'Sender can update file permissions') THEN
    CREATE POLICY "Sender can update file permissions"
      ON file_permissions FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM file_transfers ft
          JOIN earth_ids ei ON ei.id = ft.sender_earth_id
          WHERE ft.id = file_permissions.file_transfer_id AND ei.auth_user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM file_transfers ft
          JOIN earth_ids ei ON ei.id = ft.sender_earth_id
          WHERE ft.id = file_permissions.file_transfer_id AND ei.auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_permissions' AND policyname = 'Recipients can view their own permissions') THEN
    CREATE POLICY "Recipients can view their own permissions"
      ON file_permissions FOR SELECT TO authenticated
      USING (recipient_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_permissions' AND policyname = 'Recipients can update own download timestamp') THEN
    CREATE POLICY "Recipients can update own download timestamp"
      ON file_permissions FOR UPDATE TO authenticated
      USING (recipient_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()))
      WITH CHECK (recipient_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()));
  END IF;
END $$;

-- ─── file_chunks ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS file_chunks (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  file_transfer_id uuid        NOT NULL REFERENCES file_transfers(id) ON DELETE CASCADE,
  chunk_index      integer     NOT NULL,
  object_key       text        NOT NULL,
  size_bytes       integer     NOT NULL DEFAULT 0,
  chunk_hash       text        NOT NULL DEFAULT '',
  uploaded_at      timestamptz,
  UNIQUE (file_transfer_id, chunk_index)
);

ALTER TABLE file_chunks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_chunks' AND policyname = 'Sender can view own file chunks') THEN
    CREATE POLICY "Sender can view own file chunks"
      ON file_chunks FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM file_transfers ft
          JOIN earth_ids ei ON ei.id = ft.sender_earth_id
          WHERE ft.id = file_chunks.file_transfer_id AND ei.auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_chunks' AND policyname = 'Sender can insert file chunks') THEN
    CREATE POLICY "Sender can insert file chunks"
      ON file_chunks FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM file_transfers ft
          JOIN earth_ids ei ON ei.id = ft.sender_earth_id
          WHERE ft.id = file_chunks.file_transfer_id AND ei.auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_chunks' AND policyname = 'Sender can update file chunks') THEN
    CREATE POLICY "Sender can update file chunks"
      ON file_chunks FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM file_transfers ft
          JOIN earth_ids ei ON ei.id = ft.sender_earth_id
          WHERE ft.id = file_chunks.file_transfer_id AND ei.auth_user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM file_transfers ft
          JOIN earth_ids ei ON ei.id = ft.sender_earth_id
          WHERE ft.id = file_chunks.file_transfer_id AND ei.auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_chunks' AND policyname = 'Recipients can view permitted chunk metadata') THEN
    CREATE POLICY "Recipients can view permitted chunk metadata"
      ON file_chunks FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM file_permissions fp
          JOIN earth_ids ei ON ei.id = fp.recipient_earth_id
          WHERE fp.file_transfer_id = file_chunks.file_transfer_id
            AND ei.auth_user_id = auth.uid()
            AND fp.can_download = true
        )
      );
  END IF;
END $$;

-- ─── file_delivery_events ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS file_delivery_events (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  file_transfer_id uuid        NOT NULL REFERENCES file_transfers(id) ON DELETE CASCADE,
  earth_id         uuid        NOT NULL REFERENCES earth_ids(id) ON DELETE CASCADE,
  event_type       text        NOT NULL,
  detail           text,
  chunk_index      integer,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE file_delivery_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_delivery_events' AND policyname = 'Participants can view file delivery events') THEN
    CREATE POLICY "Participants can view file delivery events"
      ON file_delivery_events FOR SELECT TO authenticated
      USING (
        earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM file_transfers ft
          JOIN earth_ids ei ON ei.id = ft.sender_earth_id
          WHERE ft.id = file_delivery_events.file_transfer_id AND ei.auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_delivery_events' AND policyname = 'Participants can insert file delivery events') THEN
    CREATE POLICY "Participants can insert file delivery events"
      ON file_delivery_events FOR INSERT TO authenticated
      WITH CHECK (
        earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM file_transfers ft
          JOIN earth_ids ei ON ei.id = ft.sender_earth_id
          WHERE ft.id = file_delivery_events.file_transfer_id AND ei.auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── file_retention_policies ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS file_retention_policies (
  file_transfer_id uuid        PRIMARY KEY REFERENCES file_transfers(id) ON DELETE CASCADE,
  policy           text        NOT NULL CHECK (policy IN ('after_download','24h','7d','30d','manual')),
  expires_at       timestamptz,
  deleted_at       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE file_retention_policies ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_retention_policies' AND policyname = 'Sender can view retention policy') THEN
    CREATE POLICY "Sender can view retention policy"
      ON file_retention_policies FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM file_transfers ft
          JOIN earth_ids ei ON ei.id = ft.sender_earth_id
          WHERE ft.id = file_retention_policies.file_transfer_id AND ei.auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_retention_policies' AND policyname = 'Sender can insert retention policy') THEN
    CREATE POLICY "Sender can insert retention policy"
      ON file_retention_policies FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM file_transfers ft
          JOIN earth_ids ei ON ei.id = ft.sender_earth_id
          WHERE ft.id = file_retention_policies.file_transfer_id AND ei.auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_retention_policies' AND policyname = 'Sender can update retention policy') THEN
    CREATE POLICY "Sender can update retention policy"
      ON file_retention_policies FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM file_transfers ft
          JOIN earth_ids ei ON ei.id = ft.sender_earth_id
          WHERE ft.id = file_retention_policies.file_transfer_id AND ei.auth_user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM file_transfers ft
          JOIN earth_ids ei ON ei.id = ft.sender_earth_id
          WHERE ft.id = file_retention_policies.file_transfer_id AND ei.auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_file_transfers_sender       ON file_transfers (sender_earth_id);
CREATE INDEX IF NOT EXISTS idx_file_transfers_conv         ON file_transfers (conversation_id);
CREATE INDEX IF NOT EXISTS idx_file_permissions_transfer   ON file_permissions (file_transfer_id);
CREATE INDEX IF NOT EXISTS idx_file_permissions_recipient  ON file_permissions (recipient_earth_id);
CREATE INDEX IF NOT EXISTS idx_file_chunks_transfer        ON file_chunks (file_transfer_id);
CREATE INDEX IF NOT EXISTS idx_file_delivery_events_transfer ON file_delivery_events (file_transfer_id);
