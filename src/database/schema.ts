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
    googleId: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("users_googleId").on(t.googleId),
    uniqueIndex("users_email").on(t.email),
  ]
);

export const tabs = pgTable(
  "tabs",
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: uuid()
      .notNull()
      .references(() => users.id),
    title: text().notNull(),
    isClosed: boolean().default(false),
    createdAt: timestamp().defaultNow().notNull(),
    serviceCharge: integer().notNull().default(10),
    closedAt: timestamp(),
  },
  (t) => [uniqueIndex("tabs_ownerid").on(t.ownerId)]
);

export const participants = pgTable(
  "participants",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    userId: uuid().references(() => users.id),
    tabId: uuid()
      .notNull()
      .references(() => tabs.id),
  },
  (t) => [
    uniqueIndex("participants_tabid_name").on(t.tabId, t.name),
    index("participants_tabid").on(t.tabId),
  ]
);

export const items = pgTable(
  "items",
  {
    id: uuid().primaryKey().defaultRandom(),
    description: text().notNull(),
    unitPrice: numeric({ precision: 5, scale: 2 }).notNull(),
    tabId: uuid()
      .notNull()
      .references(() => tabs.id),
    quantity: integer().notNull().default(1),
  },
  (t) => [index("items_tabid").on(t.tabId)]
);

export const parts = pgTable(
  "parts",
  {
    id: uuid().primaryKey().defaultRandom(),
    tabId: uuid()
      .notNull()
      .references(() => tabs.id),
    participantId: uuid()
      .notNull()
      .references(() => participants.id),
    itemId: uuid()
      .notNull()
      .references(() => items.id),
    partsCount: integer().notNull().default(0),
  },
  (t) => [
    uniqueIndex().on(t.participantId, t.itemId),
    index("parts_tabid").on(t.tabId),
    index("parts_itemid").on(t.itemId),
    index("parts_participantid").on(t.participantId),
  ]
);
