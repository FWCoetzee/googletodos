-- Fix schema_validation_mismatch: Add VARCHAR(500) constraint to task column
ALTER TABLE todos ALTER COLUMN task TYPE VARCHAR(500);

-- Fix missing_position_column: Add position column for reordering
ALTER TABLE todos ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_todos_position ON todos(position);