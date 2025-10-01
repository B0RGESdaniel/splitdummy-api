import {
  pgTable,
  uuid,
  text,
  integer,
  uniqueIndex,
  timestamp,
  boolean,
  index,
  numeric,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    email: text().notNull().unique(),
    googleId: text("google_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("users_google_id").on(t.googleId),
    uniqueIndex("users_email").on(t.email),
  ]
);

export const tabs = pgTable(
  "tabs",
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text().notNull(),
    isClosed: boolean("is_closed").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    serviceCharge: integer("service_charge").notNull().default(10),
    closedAt: timestamp("closed_at"),
  },
  (t) => [uniqueIndex("tabs_owner_id").on(t.ownerId)]
);

export const participants = pgTable(
  "participants",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    userId: uuid("user_id").references(() => users.id),
    tabId: uuid()
      .notNull()
      .references(() => tabs.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("participants_tab_id_name").on(t.tabId, t.name),
    uniqueIndex("participants_user_id").on(t.userId),
    index("participants_tab_id").on(t.tabId),
  ]
);

export const items = pgTable(
  "items",
  {
    id: uuid().primaryKey().defaultRandom(),
    description: text().notNull(),
    unitPrice: numeric("unit_price", { precision: 5, scale: 2 }).notNull(),
    tabId: uuid("tab_id")
      .notNull()
      .references(() => tabs.id, { onDelete: "cascade" }),
    quantity: integer().notNull().default(1),
  },
  (t) => [index("items_tab_id").on(t.tabId)]
);

export const parts = pgTable(
  "parts",
  {
    id: uuid().primaryKey().defaultRandom(),
    tabId: uuid("tab_id")
      .notNull()
      .references(() => tabs.id, { onDelete: "cascade" }),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    partsCount: integer("parts_count").notNull().default(0),
  },
  (t) => [
    uniqueIndex().on(t.participantId, t.itemId),
    index("parts_tab_id").on(t.tabId),
    index("parts_item_id").on(t.itemId),
    index("parts_participant_id").on(t.participantId),
  ]
);
