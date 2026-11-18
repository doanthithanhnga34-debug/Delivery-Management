CREATE TABLE
    IF NOT EXISTS ticket_analysis (
        ticket_id TEXT PRIMARY KEY,
        shipper_id TEXT NOT NULL,
        content_hash TEXT NOT NULL,
        analysis_json TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (
            status IN ('pending', 'completed', 'failed', 'review')
        ),
        analysis_version INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        analyzed_at INTEGER,
        updated_at INTEGER NOT NULL
    )
;
CREATE INDEX IF NOT EXISTS idx_ticket_analysis_shipper
ON ticket_analysis(shipper_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ticket_analysis_cleanup
ON ticket_analysis(status, created_at);