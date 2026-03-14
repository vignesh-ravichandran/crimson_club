-- Crimson Club: users and sessions (foundation auth). Design: docs/db/data-model.md
CREATE TABLE `users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL UNIQUE,
  `password_hash` text NOT NULL,
  `public_display_name` text NOT NULL,
  `primary_journey_id` text,
  `timezone` text NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE `sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `token_hash` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer NOT NULL
);

CREATE INDEX `sessions_token_hash_expires_at` ON `sessions` (`token_hash`, `expires_at`);
