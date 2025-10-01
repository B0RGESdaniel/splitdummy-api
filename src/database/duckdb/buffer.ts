import { connection } from "./client.ts";
import { randomUUID } from "node:crypto";
import { pool } from "../postgres/client.ts";
import { drizzle } from "drizzle-orm/node-postgres";

const FLUSH_INTERVAL_MS = Number(process.env.FLUSH_INTERVAL_MS ?? 5000);
const FLUSH_MAX_ROWS = Number(process.env.FLUSH_MAX_ROWS ?? 2000);
const CHUNK_SIZE = Number(process.env.CHUNK_SIZE ?? 200);

let flushing = false;
let flushInterval: NodeJS.Timeout | null = null;

export async function initDuckTables() {
  await connection.run(`
    CREATE TABLE IF NOT EXISTS item_changes (
      id TEXT,
      item_id TEXT,
      tab_id TEXT,
      delta INTEGER
    );
  `);

  await connection.run(`
    CREATE TABLE IF NOT EXISTS part_changes (
      id TEXT,
      item_id TEXT,
      participant_id TEXT,
      tab_id TEXT,
      delta INTEGER
    );
  `);
}

async function allDuck(sql: string) {
  const reader = await connection.runAndReadAll(sql);

  const rows = reader.getRowObjectsJson();

  return rows;
}

export async function recordBufferItemDelta(
  itemId: string,
  tabId: string,
  delta = 1
) {
  await connection.run(
    `INSERT INTO item_changes VALUES('${randomUUID()}', '${itemId}', '${tabId}', ${Number(
      delta
    )});`
  );
}

export async function recordBufferPartDelta(
  itemId: string,
  tabId: string,
  participantId: string,
  delta = 1
) {
  await connection.run(
    `INSERT INTO part_changes VALUES('${randomUUID()}', '${itemId}', '${participantId}', '${tabId}', ${Number(
      delta
    )});`
  );
}

export async function getBufferedItemDelta(itemId: string) {
  const reader = await connection.runAndReadAll(
    `SELECT SUM(delta) AS total_delta FROM item_changes WHERE item_id = '${itemId}';`
  );
  const rows = reader.getColumnsObjectJson();
  return Number(rows.total_delta[0]) ?? 0;
}

export async function getBufferedPartDelta(
  itemId: string,
  tabId: string,
  participantId: string
) {
  const result = await allDuck(`SELECT SUM(delta) AS total_delta 
      FROM part_changes WHERE item_id = '${itemId}' AND tab_id = '${tabId}' AND participant_id = '${participantId}';`);
  return Number(result[0].total_delta) ?? 0;
}

async function flushBufferToPostgres() {
  flushing = true;
  try {
    const itemAgg = await allDuck(
      `
        SELECT item_id, tab_id, SUM(delta) AS total_delta
        FROM item_changes
        GROUP BY item_id, tab_id
        ORDER BY SUM(delta) DESC
        LIMIT ${FLUSH_MAX_ROWS}
      `
    );

    const partAgg = await allDuck(
      ` 
        SELECT tab_id, participant_id, item_id, SUM(delta) AS total_delta
        FROM part_changes
        GROUP BY tab_id, participant_id, item_id
        ORDER BY SUM(delta) DESC
        LIMIT ${FLUSH_MAX_ROWS}
      `
    );

    if (itemAgg.length === 0 && partAgg.length === 0) return;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      for (let i = 0; i < itemAgg.length; i += CHUNK_SIZE) {
        const chunk = itemAgg.slice(i, i + CHUNK_SIZE);
        const params: any[] = [];
        const valuesSql = chunk
          .map((row, index) => {
            const base = index * 2; // feito assim para sempre pegar os parametros de 2 em 2
            params.push(row.item_id, row.total_delta);
            return `($${base + 1}::uuid, $${base + 2}::int)`;
          })
          .join(", ");

        const updateSql = `
          WITH changes(item_id, total_delta) AS ( VALUES ${valuesSql} )
          UPDATE items
          SET quantity = GREATEST(items.quantity + changes.total_delta, 0)
          FROM changes
          WHERE items.id = changes.item_id
            AND NOT EXISTS (SELECT 1 FROM tabs WHERE tabs.id = items.tab_id AND tabs.is_closed = true);
        `;

        await client.query(updateSql, params);
      }
      for (let i = 0; i < partAgg.length; i += CHUNK_SIZE) {
        const chunk = partAgg.slice(i, i + CHUNK_SIZE);
        const params: any[] = [];
        const valuesSql = chunk
          .map((r, idx) => {
            const base = idx * 4;
            params.push(r.tab_id, r.participant_id, r.item_id, r.total_delta);
            return `($${base + 1}::uuid, $${base + 2}::uuid, $${
              base + 3
            }::uuid, $${base + 4}::int)`;
          })
          .join(", ");
        const updateSql = `
          WITH changes(tab_id, participant_id, item_id, total_delta) AS ( VALUES ${valuesSql} )
          UPDATE parts
          SET parts_count = GREATEST(parts.parts_count + changes.total_delta, 0)
          FROM changes
          WHERE parts.tab_id = changes.tab_id
            AND parts.participant_id = changes.participant_id
            AND parts.item_id = changes.item_id
            AND NOT EXISTS (SELECT 1 FROM tabs WHERE tabs.id = parts.tab_id AND tabs.is_closed = true);
        `;
        await client.query(updateSql, params);
      }

      await client.query("COMMIT");
      await connection.run(`DELETE FROM item_changes;`);
      await connection.run(`DELETE FROM part_changes;`);
    } catch (error) {
      console.log(error);
      try {
        await client.query("ROLLBACK");
      } catch (e) {}
    } finally {
      client.release();
    }
  } catch (error) {
    console.log(error);
  } finally {
    flushing = false;
  }
}

export function startBufferWorker() {
  if (flushInterval) return;
  flushInterval = setInterval(() => {
    void flushBufferToPostgres();
  }, FLUSH_INTERVAL_MS);
}

export async function stopBufferWorker() {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }

  connection.closeSync();
}
