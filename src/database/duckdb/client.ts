import { DuckDBInstance } from "@duckdb/node-api";

const instance = await DuckDBInstance.create("temp.duckdb");

export const connection = await instance.connect();
