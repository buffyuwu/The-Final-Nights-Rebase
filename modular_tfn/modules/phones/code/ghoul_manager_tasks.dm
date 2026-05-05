// task definitions for the ghoul manager. add new tasks here.
// mood_change - applied to ghoul mood on completion. positive or negative numbers
// job_wage - if set, starts a daily-paying job at this amount
// completion_text - activity log entry written when the task finishes
// requires - optional task id. ghoul must have completed that task to see this one
// balance_bonus - one-time deposit to the manager balance on completion
/datum/ghoul_manager/proc/task_list()
	return list(
		list(
			"id" = "sleep",
			"label" = "Get some sleep",
			"duration_hours" = 8,
			"details" = "+3 mood",
			"mood_change" = 3,
			"completion_text" = "Slept, feeling refreshed",
		),
		list(
			"id" = "retail_job",
			"label" = "Get a retail job",
			"duration_hours" = 3,
			"details" = "-3 mood, +$200/day income",
			"mood_change" = -3,
			"job_wage" = 300,
			"completion_text" = "Got hired at a retail store",
		),
		list(
			"id" = "transam_job",
			"label" = "Get a job at TransAm",
			"duration_hours" = 3,
			"details" = "-1 mood, +$200/day income",
			"mood_change" = -1,
			"job_wage" = 600,
			"completion_text" = "Started a job at TransAm",
		),
		list(
			"id" = "criminal_job",
			"label" = "Teach how to do break-ins",
			"duration_hours" = 1,
			"details" = "+1 mood, +$600/day income",
			"mood_change" = -1,
			"job_wage" = 600,
			"completion_text" = "Started a life of crime under your careful tutelige",
		),
		// retail branch
		list(
			"id" = "retail_extra_shifts",
			"label" = "Pick up extra shift",
			"duration_hours" = 6,
			"details" = "+$100 bonus",
			"mood_change" = -1,
			"completion_text" = "Took an extra shift at their retail job.",
			"requires" = "retail_job",
		),
		list(
			"id" = "retail_shmooze",
			"label" = "Relax and take it easy at work",
			"duration_hours" = 4,
			"details" = "+2 mood",
			"mood_change" = 2,
			"completion_text" = "Taking it easy at their TransAm job.",
			"requires" = "transam_job",
		),
		// transam branch
		list(
			"id" = "transam_night_shift",
			"label" = "Pick up a night shift",
			"duration_hours" = 6,
			"details" = "+$150 bonus",
			"completion_text" = "Took a night shift at TransAm.",
			"requires" = "transam_job",
		),
		list(
			"id" = "transam_shmooze",
			"label" = "Relax and take it easy at work",
			"duration_hours" = 4,
			"details" = "+2 mood",
			"mood_change" = 2,
			"completion_text" = "Taking it easy at their TransAm job.",
			"requires" = "transam_job",
		),
	)
