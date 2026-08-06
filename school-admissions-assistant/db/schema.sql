-- The Admin — database schema
-- Generated from the corrected ERD (Step 1). Postgres (Neon).
-- No many-to-many relationships exist in this model, so no junction tables are needed —
-- every relationship here is one-to-many.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE parent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE program (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    level TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE service (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- program_id and service_id are both nullable: a fee can belong to a program
-- (e.g. Primary tuition), a service (e.g. Full Boarding), or neither
-- (a standalone charge like Admission Fee or Uniform) — but never both at once.
CREATE TABLE fee (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES program(id) ON DELETE CASCADE,
    service_id UUID REFERENCES service(id) ON DELETE CASCADE,
    category TEXT,
    fee_type TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fee_not_both_program_and_service CHECK (
        NOT (program_id IS NOT NULL AND service_id IS NOT NULL)
    )
);

-- admin_id is nullable: no upload feature exists yet, so today's brochure
-- has no attributed uploader.
CREATE TABLE brochure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- parent_id is nullable: the live app has one shared login today, not
-- individual parent accounts, so most inquiries won't have a linked parent yet.
CREATE TABLE inquiry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES parent(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- admin_id is nullable and source defaults to 'ai': the live app answers
-- automatically today; a human-authored override is a future capability.
CREATE TABLE response (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES inquiry(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES admin(id) ON DELETE SET NULL,
    source TEXT NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'admin')),
    response_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inquiry_parent_id ON inquiry(parent_id);
CREATE INDEX idx_response_inquiry_id ON response(inquiry_id);
CREATE INDEX idx_response_admin_id ON response(admin_id);
CREATE INDEX idx_fee_program_id ON fee(program_id);
CREATE INDEX idx_fee_service_id ON fee(service_id);
CREATE INDEX idx_brochure_admin_id ON brochure(admin_id);
