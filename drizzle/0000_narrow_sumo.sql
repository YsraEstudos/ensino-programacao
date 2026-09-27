CREATE TABLE `user_progress` (
	`user_id` text PRIMARY KEY NOT NULL,
	`progress_json` text DEFAULT '{}' NOT NULL,
	`updated_at` integer DEFAULT 0 NOT NULL
);
