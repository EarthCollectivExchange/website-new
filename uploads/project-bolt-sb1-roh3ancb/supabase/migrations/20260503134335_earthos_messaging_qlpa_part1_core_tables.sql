/*
  # EarthOS Messaging — QLPA Foundation: Part 1 — Core Tables

  Creates earth_ids, consent_matrices, safety_policies, trust_relationships,
  conversations (with deferred RLS), conversation_members, messages,
  message_actions, and ledger_events.

  RLS policies that cross-reference conversation_members are added in Part 2
  after all tables exist.
*/

-- ─── EarthIDs ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS earth_ids (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id             uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  handle                   text NOT NULL UNIQUE,
  display_name             text NOT NULL DEFAULT '',
  avatar_url               text,
  bio                      text,
  sovereign_since          timestamptz NOT NULL DEFAULT now(),
  is_active                boolean NOT NULL DEFAULT true,
  storage_preference       text NOT NULL DEFAULT 'encrypted_relay'
                           CHECK (storage_preference IN ('local_only','encrypted_relay','encrypted_backup')),
  intention_mirror_config  jsonb NOT NULL DEFAULT '{"enabled":true,"checkBeforeSending":true,"toneReflection":true,"harmfulPatternWarning":true,"userCanOverride":true,"reflectionMode":"soft"}',
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE earth_ids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "EarthID owner can read own record"
  ON earth_ids FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "EarthID owner can insert own record"
  ON earth_ids FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "EarthID owner can update own record"
  ON earth_ids FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- ─── Consent Matrices ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS consent_matrices (
  id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  earth_id                        uuid NOT NULL UNIQUE REFERENCES earth_ids(id) ON DELETE CASCADE,
  allow_direct_from               text[] NOT NULL DEFAULT ARRAY['trusted'],
  require_request_from            text[] NOT NULL DEFAULT ARRAY['known','community'],
  allow_group_invite_from         text[] NOT NULL DEFAULT ARRAY['trusted','known'],
  allow_event_invite_from         text[] NOT NULL DEFAULT ARRAY['trusted','known','community'],
  allow_project_invite_from       text[] NOT NULL DEFAULT ARRAY['trusted','known'],
  allow_contribution_request_from text[] NOT NULL DEFAULT ARRAY['trusted'],
  updated_at                      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE consent_matrices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "EarthID owner can read own consent matrix"
  ON consent_matrices FOR SELECT
  TO authenticated
  USING (
    earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "EarthID owner can insert own consent matrix"
  ON consent_matrices FOR INSERT
  TO authenticated
  WITH CHECK (
    earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "EarthID owner can update own consent matrix"
  ON consent_matrices FOR UPDATE
  TO authenticated
  USING (earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()))
  WITH CHECK (earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()));

-- ─── Safety Policies ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS safety_policies (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  earth_id                      uuid NOT NULL UNIQUE REFERENCES earth_ids(id) ON DELETE CASCADE,
  blocked_earth_ids             uuid[] NOT NULL DEFAULT '{}',
  muted_earth_ids               uuid[] NOT NULL DEFAULT '{}',
  rate_limit_unknown_senders    boolean NOT NULL DEFAULT true,
  max_messages_per_hour_unknown integer NOT NULL DEFAULT 3,
  max_emergency_signals         integer NOT NULL DEFAULT 2,
  report_abuse                  boolean NOT NULL DEFAULT true,
  updated_at                    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE safety_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "EarthID owner can read own safety policy"
  ON safety_policies FOR SELECT
  TO authenticated
  USING (
    earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "EarthID owner can insert own safety policy"
  ON safety_policies FOR INSERT
  TO authenticated
  WITH CHECK (
    earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "EarthID owner can update own safety policy"
  ON safety_policies FOR UPDATE
  TO authenticated
  USING (earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()))
  WITH CHECK (earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()));

-- ─── Trust Relationships ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS trust_relationships (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_earth_id  uuid NOT NULL REFERENCES earth_ids(id) ON DELETE CASCADE,
  to_earth_id    uuid NOT NULL REFERENCES earth_ids(id) ON DELETE CASCADE,
  level          text NOT NULL
                 CHECK (level IN ('self','trusted','known','community','unknown','blocked')),
  granted_at     timestamptz NOT NULL DEFAULT now(),
  notes          text,
  UNIQUE (from_earth_id, to_earth_id)
);

ALTER TABLE trust_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "EarthID owner can read own trust relationships"
  ON trust_relationships FOR SELECT
  TO authenticated
  USING (
    from_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
    OR
    to_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "EarthID owner can insert trust relationships"
  ON trust_relationships FOR INSERT
  TO authenticated
  WITH CHECK (
    from_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "EarthID owner can update own trust relationships"
  ON trust_relationships FOR UPDATE
  TO authenticated
  USING (from_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()))
  WITH CHECK (from_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()));

CREATE POLICY "EarthID owner can delete own trust relationships"
  ON trust_relationships FOR DELETE
  TO authenticated
  USING (from_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_trust_from  ON trust_relationships (from_earth_id);
CREATE INDEX IF NOT EXISTS idx_trust_to    ON trust_relationships (to_earth_id);
CREATE INDEX IF NOT EXISTS idx_trust_level ON trust_relationships (level);

-- ─── Conversations ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type                text NOT NULL
                      CHECK (type IN ('direct','group','project','event','place','cause','council','support_circle')),
  title               text,
  description         text,
  created_by_earth_id uuid NOT NULL REFERENCES earth_ids(id) ON DELETE RESTRICT,
  context_entity_id   uuid,
  storage_mode        text NOT NULL DEFAULT 'encrypted_relay'
                      CHECK (storage_mode IN ('local_only','encrypted_relay','encrypted_backup')),
  is_archived         boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Temporary permissive SELECT so conversation_members can be created.
-- This policy is replaced in Part 2 once conversation_members exists.
CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Conversation creator can update"
  ON conversations FOR UPDATE
  TO authenticated
  USING (created_by_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()))
  WITH CHECK (created_by_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_conversations_type       ON conversations (type);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations (created_by_earth_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations (updated_at DESC);

-- ─── Conversation Members ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversation_members (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  earth_id         uuid NOT NULL REFERENCES earth_ids(id) ON DELETE CASCADE,
  role             text NOT NULL DEFAULT 'member'
                   CHECK (role IN ('owner','admin','member','observer')),
  trust_snapshot   text NOT NULL DEFAULT 'unknown'
                   CHECK (trust_snapshot IN ('self','trusted','known','community','unknown','blocked')),
  joined_at        timestamptz NOT NULL DEFAULT now(),
  last_read_at     timestamptz,
  UNIQUE (conversation_id, earth_id)
);

ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read their own memberships"
  ON conversation_members FOR SELECT
  TO authenticated
  USING (
    earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
    OR
    conversation_id IN (
      SELECT conversation_id FROM conversation_members cm
      WHERE cm.earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "EarthID owner can insert memberships"
  ON conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (
    earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
    OR
    conversation_id IN (
      SELECT id FROM conversations
      WHERE created_by_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "Members can update own membership record"
  ON conversation_members FOR UPDATE
  TO authenticated
  USING (earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()))
  WITH CHECK (earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_members_conversation ON conversation_members (conversation_id);
CREATE INDEX IF NOT EXISTS idx_members_earth_id     ON conversation_members (earth_id);

-- ─── Messages ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS messages (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id         uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id               uuid NOT NULL REFERENCES earth_ids(id) ON DELETE RESTRICT,
  type                    text NOT NULL
                          CHECK (type IN ('text','voice','video','file','proposal','agreement','task','contribution','ritual','event_invite','emergency_signal')),
  body                    text,
  encrypted_payload       text,
  consent_status          text NOT NULL DEFAULT 'allowed'
                          CHECK (consent_status IN ('allowed','pending','blocked','emergency')),
  storage_mode            text NOT NULL DEFAULT 'encrypted_relay'
                          CHECK (storage_mode IN ('local_only','encrypted_relay','encrypted_backup')),
  trust_level             text NOT NULL DEFAULT 'unknown'
                          CHECK (trust_level IN ('self','trusted','known','community','unknown','blocked')),
  action_state            text NOT NULL DEFAULT 'none'
                          CHECK (action_state IN ('none','task','agreement','event','contribution')),
  intention_mirror_state  text NOT NULL DEFAULT 'not_checked'
                          CHECK (intention_mirror_state IN ('not_checked','clear','reflected','user_overrode')),
  integrity_hash          text NOT NULL DEFAULT '',
  reply_to_message_id     uuid REFERENCES messages(id) ON DELETE SET NULL,
  is_deleted              boolean NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now(),
  edited_at               timestamptz
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation members can read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_members
      WHERE earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "EarthID owner can insert own messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
    AND
    conversation_id IN (
      SELECT conversation_id FROM conversation_members
      WHERE earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "EarthID owner can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()))
  WITH CHECK (sender_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender       ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_type         ON messages (type);
CREATE INDEX IF NOT EXISTS idx_messages_trust        ON messages (trust_level);
CREATE INDEX IF NOT EXISTS idx_messages_mirror_state ON messages (intention_mirror_state);

-- ─── Message Actions ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS message_actions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id             uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  conversation_id        uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  initiated_by_earth_id  uuid NOT NULL REFERENCES earth_ids(id) ON DELETE RESTRICT,
  action_type            text NOT NULL
                         CHECK (action_type IN ('none','task','agreement','event','contribution')),
  status                 text NOT NULL DEFAULT 'open'
                         CHECK (status IN ('open','accepted','declined','completed','expired')),
  payload                jsonb,
  due_at                 timestamptz,
  resolved_at            timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE message_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation members can read message actions"
  ON message_actions FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_members
      WHERE earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "EarthID owner can insert message actions"
  ON message_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    initiated_by_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "EarthID owner can update own message actions"
  ON message_actions FOR UPDATE
  TO authenticated
  USING (initiated_by_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()))
  WITH CHECK (initiated_by_earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_actions_message      ON message_actions (message_id);
CREATE INDEX IF NOT EXISTS idx_actions_conversation ON message_actions (conversation_id);
CREATE INDEX IF NOT EXISTS idx_actions_status       ON message_actions (status);

-- ─── Ledger Events ─────────────────────────────────────────────────────────────
-- Append-only. No update or delete policies — immutable by design.

CREATE TABLE IF NOT EXISTS ledger_events (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  earth_id           uuid NOT NULL REFERENCES earth_ids(id) ON DELETE RESTRICT,
  related_earth_id   uuid REFERENCES earth_ids(id) ON DELETE SET NULL,
  conversation_id    uuid REFERENCES conversations(id) ON DELETE SET NULL,
  message_id         uuid REFERENCES messages(id) ON DELETE SET NULL,
  event_type         text NOT NULL,
  passed             boolean NOT NULL DEFAULT true,
  detail             text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ledger_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "EarthID owner can read own ledger events"
  ON ledger_events FOR SELECT
  TO authenticated
  USING (
    earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "EarthID owner can insert ledger events"
  ON ledger_events FOR INSERT
  TO authenticated
  WITH CHECK (
    earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_ledger_earth_id     ON ledger_events (earth_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_event_type   ON ledger_events (event_type);
CREATE INDEX IF NOT EXISTS idx_ledger_conversation ON ledger_events (conversation_id);
CREATE INDEX IF NOT EXISTS idx_ledger_message      ON ledger_events (message_id);
