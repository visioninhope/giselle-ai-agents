ALTER TABLE "agents" ALTER COLUMN "graph" SET DEFAULT '{"nodes":[],"connectors":[]}'::jsonb;

-- migrate existing data
UPDATE "agents" SET "graph" = '{"nodes":[],"connectors":[]}'::jsonb;
