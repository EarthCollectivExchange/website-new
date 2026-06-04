/*
  # EarthOS Messaging — QLPA Part 2: Conversation SELECT Policy

  Adds the SELECT policy on conversations that references conversation_members.
  This runs after Part 1 so the cross-table reference resolves correctly.
*/

CREATE POLICY "Conversation members can read conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT conversation_id FROM conversation_members
      WHERE earth_id IN (SELECT id FROM earth_ids WHERE auth_user_id = auth.uid())
    )
  );
