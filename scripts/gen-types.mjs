// Generate TypeScript types from the Buzzmart backend's OpenAPI schema.
//
// Usage:
//   npm run gen:types                                # against local dev backend
//   SCHEMA_URL=https://.../api/schema/ npm run gen:types
//
// Why this script exists (vs piping the schema URL straight into
// `openapi-typescript`): drf-spectacular references a `Notification` schema
// in the notifications-list response but does not emit a definition for it.
// The raw schema fails to parse. We patch it before generating.
//
// If/when the backend adds a NotificationSerializer with @extend_schema, the
// `Notification` patch below becomes a no-op and can be removed.

import fs from "node:fs/promises";
import { execSync } from "node:child_process";

const SCHEMA_URL = process.env.SCHEMA_URL ?? "http://127.0.0.1:8000/api/schema/";
const TMP = "/tmp/buzzmart-schema-patched.yaml";
const OUT = "types/api-generated.ts";

const res = await fetch(SCHEMA_URL);
if (!res.ok) {
    console.error(`Failed to fetch schema: HTTP ${res.status} from ${SCHEMA_URL}`);
    process.exit(1);
}
let schema = await res.text();

const hasBrokenRef = schema.includes("#/components/schemas/Notification");
const hasDefinition = /^ {4}Notification:/m.test(schema);

if (hasBrokenRef && !hasDefinition) {
    const inject = `    Notification:
      type: object
      properties:
        id: { type: integer }
        type: { type: string, enum: [order, product] }
        message: { type: string }
        is_read: { type: boolean }
        time: { type: string }
        time_ago: { type: string }
        created_at: { type: string, format: date-time }
      required: [id, type, message, is_read]
`;
    schema = schema.replace(/^( {2}schemas:\n)/m, `$1${inject}`);
    console.log("Patched: injected Notification schema definition");
}

await fs.writeFile(TMP, schema);
execSync(`npx openapi-typescript ${TMP} -o ${OUT}`, { stdio: "inherit" });
console.log(`Wrote ${OUT}`);
