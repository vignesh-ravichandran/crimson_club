-- Goals, weekly_reviews, lessons. Design: docs/db/data-model.md
CREATE TABLE `goals` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`),
  `journey_id` text NOT NULL REFERENCES `journeys`(`id`),
  `goal_type` text NOT NULL,
  `period_start` text NOT NULL,
  `period_end` text NOT NULL,
  `goal_statement` text,
  `outcome` integer,
  `outcome_updated_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE `weekly_reviews` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`),
  `journey_id` text NOT NULL REFERENCES `journeys`(`id`),
  `week_start` text NOT NULL,
  `done` integer NOT NULL,
  `notes` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE `lessons` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`),
  `journey_id` text NOT NULL REFERENCES `journeys`(`id`),
  `text` text NOT NULL,
  `source_date` text NOT NULL,
  `source_type` text NOT NULL,
  `dimension_id` text REFERENCES `dimensions`(`id`),
  `created_at` integer NOT NULL
);

CREATE UNIQUE INDEX `goals_user_journey_type_period` ON `goals` (`user_id`, `journey_id`, `goal_type`, `period_start`);
CREATE INDEX `goals_journey_user` ON `goals` (`journey_id`, `user_id`);
CREATE UNIQUE INDEX `weekly_reviews_user_journey_week` ON `weekly_reviews` (`user_id`, `journey_id`, `week_start`);
CREATE INDEX `weekly_reviews_journey_user` ON `weekly_reviews` (`journey_id`, `user_id`);
CREATE INDEX `lessons_journey_user` ON `lessons` (`journey_id`, `user_id`);
CREATE INDEX `lessons_dimension_id` ON `lessons` (`dimension_id`);
