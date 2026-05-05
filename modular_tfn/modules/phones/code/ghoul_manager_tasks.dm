// task definitions for the ghoul manager. add new tasks here.
// mood_change - applied to ghoul mood on completion. positive or negative numbers
// job_wage - if set, starts a daily-paying job at this amount
// completion_text - activity log entry written when the task finishes
// requires - optional task id. ghoul must have completed that task to see this one
// balance_bonus - one-time bonus on completion
/datum/ghoul_manager/proc/task_list()
	return list(
		list(
			"id" = "sleep",
			"label" = "Get some sleep",
			"duration_hours" = 0.017,
			"details" = "+3 mood",
			"mood_change" = 3,
			"completion_text" = "Slept, feeling refreshed",
		),
		list(
			"id" = "retail_job",
			"label" = "Get a retail job",
			"duration_hours" = 0.033,
			"details" = "-3 mood, +$200/day income",
			"mood_change" = -3,
			"job_wage" = 300,
			"conflicts" = "transam_job",
			"completion_text" = "Got hired at a retail store",
		),
		list(
			"id" = "transam_job",
			"label" = "Get a job at TransAm",
			"duration_hours" = 0.033,
			"details" = "-1 mood, +$200/day income",
			"mood_change" = -1,
			"job_wage" = 600,
			"conflicts" = "retail_job",
			"completion_text" = "Started a job at TransAm",
		),
		list(
			"id" = "criminal_job",
			"label" = "Get paid through less-than-legal means",
			"duration_hours" = 0.017,
			"details" = "+1 mood, +$600/day income",
			"mood_change" = -1,
			"job_wage" = 600,
			"completion_text" = "Started a life of crime under your careful tutelige",
			"conflicts" = list("retail_job", "transam_job"),
		),
		// retail branch
		list(
			"id" = "retail_extra_shifts",
			"label" = "Pick up extra shift",
			"duration_hours" = 0.083,
			"details" = "+$100 bonus",
			"mood_change" = -1,
			"balance_bonus" = 100,
			"completion_text" = "Took an extra shift at their retail job.",
			"requires" = "retail_job",
		),
		list(
			"id" = "retail_shmooze",
			"label" = "Relax and take it easy at work",
			"duration_hours" = 0.033,
			"details" = "+2 mood",
			"mood_change" = 2,
			"completion_text" = "Taking it easy at their retail job.",
			"requires" = "retail_job",
		),
		// transam branch
		list(
			"id" = "transam_night_shift",
			"label" = "Pick up a night shift",
			"duration_hours" = 0.083,
			"details" = "+$150 bonus",
			"balance_bonus" = 150,
			"completion_text" = "Took a night shift at TransAm.",
			"requires" = "transam_job",
		),
		list(
			"id" = "transam_shmooze",
			"label" = "Relax and take it easy at work",
			"duration_hours" = 0.033,
			"details" = "+2 mood",
			"mood_change" = 2,
			"completion_text" = "Taking it easy at their TransAm job.",
			"requires" = "transam_job",
		),
	)
