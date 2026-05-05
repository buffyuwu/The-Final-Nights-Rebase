// task definitions for the ghoul manager. add new tasks here.
// mood_change - applied to ghoul mood on completion. positive or negative numbers
// job_wage - if set, starts a daily-paying job at this amount
// completion_text - activity log entry written when the task finishes
// requires - optional task id. ghoul must have completed that task to see this one
/datum/ghoul_manager/proc/task_list()
	return list(
		list(
			"id" = "sleep",
			"label" = "Get some sleep",
			"duration_hours" = 8,
			"details" = "+3 mood",
			"mood_change" = 3,
			"completion_text" = "Slept, feeling refreshed.",
		),
		list(
			"id" = "retail_job",
			"label" = "Get a retail job",
			"duration_hours" = 3,
			"details" = "-3 mood, +$200/day income",
			"mood_change" = -3,
			"job_wage" = 200,
			"completion_text" = "Got hired at a retail store.",
		),
		list(
			"id" = "transam_job",
			"label" = "Get a job at TransAm",
			"duration_hours" = 3,
			"details" = "-1 mood, +$200/day income",
			"mood_change" = -1,
			"job_wage" = 200,
			"completion_text" = "Started a job at TransAm",
		),
	)
