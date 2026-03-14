-- Journeys, dimensions, labels, participants, daily entries, invites. Design: docs/db/data-model.md
CREATE TABLE `journeys` (
  `id` text PRIMARY KEY NOT NULL,
  `creator_id` text NOT NULL REFERENCES `users`(`id`),
  `name` text NOT NULL,
  `description` text,
  `emoji` text NOT NULL,
  `visibility` text NOT NULL,
  `start_date` text NOT NULL,
  `end_date` text,
  `why_exists` text,
  `success_vision` text,
  `what_matters_most` text,
  `what_should_not_distract` text,
  `strengths_to_play_to` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE `journey_participants` (
  `id` text PRIMARY KEY NOT NULL,
  `journey_id` text NOT NULL REFERENCES `journeys`(`id`) ON DELETE CASCADE,
  `user_id` text NOT NULL REFERENCES `users`(`id`),
  `joined_at` integer NOT NULL,
  `left_at` integer
);

CREATE TABLE `dimensions` (
  `id` text PRIMARY KEY NOT NULL,
  `journey_id` text NOT NULL REFERENCES `journeys`(`id`) ON DELETE CASCADE,
  `position` integer NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `emoji` text NOT NULL,
  `weight` real NOT NULL,
  `is_mandatory` integer NOT NULL,
  `why_matters` text,
  `what_good_looks_like` text,
  `how_helps_journey` text,
  `strength_guidance` text,
  `created_at` integer NOT NULL
);

CREATE TABLE `journey_visible_labels` (
  `journey_id` text PRIMARY KEY NOT NULL REFERENCES `journeys`(`id`) ON DELETE CASCADE,
  `label_missed` text NOT NULL,
  `label_low` text NOT NULL,
  `label_medium` text NOT NULL,
  `label_high` text NOT NULL,
  `label_excellent` text NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE `daily_entries` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`),
  `journey_id` text NOT NULL REFERENCES `journeys`(`id`),
  `date` text NOT NULL,
  `reflection_note` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE `daily_dimension_values` (
  `id` text PRIMARY KEY NOT NULL,
  `daily_entry_id` text NOT NULL REFERENCES `daily_entries`(`id`) ON DELETE CASCADE,
  `dimension_id` text NOT NULL REFERENCES `dimensions`(`id`),
  `canonical_scale` integer NOT NULL
);

CREATE TABLE `journey_invites` (
  `id` text PRIMARY KEY NOT NULL,
  `journey_id` text NOT NULL REFERENCES `journeys`(`id`) ON DELETE CASCADE,
  `email` text NOT NULL,
  `token` text NOT NULL,
  `created_at` integer NOT NULL,
  `used_at` integer
);

CREATE UNIQUE INDEX `journey_participants_journey_user` ON `journey_participants` (`journey_id`, `user_id`);
CREATE INDEX `journey_participants_user_id` ON `journey_participants` (`user_id`);
CREATE UNIQUE INDEX `daily_entries_user_journey_date` ON `daily_entries` (`user_id`, `journey_id`, `date`);
CREATE INDEX `daily_entries_journey_date` ON `daily_entries` (`journey_id`, `date`);
CREATE UNIQUE INDEX `daily_dimension_values_entry_dimension` ON `daily_dimension_values` (`daily_entry_id`, `dimension_id`);
CREATE UNIQUE INDEX `journey_invites_token` ON `journey_invites` (`token`);
