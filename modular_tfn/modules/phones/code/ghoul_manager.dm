// ghoul manager! a game within a game :)
/datum/preferences
	var/datum/ghoul_manager/ghoul_manager

/datum/preferences/load_character(slot)
	. = ..()
	var/list/save_data = savefile.get_entry("character[default_slot]")
	ghoul_manager = new
	ghoul_manager.balance = save_data?["ghoul_manager_balance"] || 0
	var/list/saved = save_data?["ghoul_manager_ghouls"]
	ghoul_manager.ghouls = (saved && islist(saved)) ? saved.Copy() : list()

/datum/preferences/save_character()
	. = ..()
	var/list/save_data = savefile.get_entry("character[default_slot]")
	if(!save_data || !ghoul_manager)
		return
	save_data["ghoul_manager_balance"] = ghoul_manager.balance
	save_data["ghoul_manager_ghouls"] = ghoul_manager.ghouls

/datum/ghoul_manager
	var/balance = 0
	var/list/ghouls = list()
	var/list/pending_recruits
	var/deposit_remaining = 10000
	COOLDOWN_DECLARE(talk_cooldown)

/datum/ghoul_manager/proc/find(name)
	for(var/list/ghoul in ghouls)
		if(ghoul["name"] == name)
			return ghoul

/datum/ghoul_manager/proc/process_completed_tasks(datum/preferences/prefs)
	var/changed = FALSE
	for(var/list/ghoul in ghouls)
		if(!ghoul["current_task"] || !ghoul["task_started"] || !ghoul["task_duration"])
			continue
		var/completion_time = ghoul["task_started"] + ghoul["task_duration"]
		if(world.realtime <= completion_time)
			continue
		var/list/task_def = null
		for(var/list/task in task_list())
			if(task["id"] == ghoul["current_task"])
				task_def = task
				break
		var/completion_stamp = ghoul["completion_stamp"] || time2text(world.time, "Month DD, hh:mm")
		var/list/activity_log = ghoul["activity"]
		if(task_def)
			var/mood_change = task_def["mood_change"] || 0
			if(mood_change)
				ghoul["mood"] = clamp((ghoul["mood"] || 0) + mood_change, 0, 10)
			if(task_def["job_wage"])
				ghoul["job_wage_amount"] = task_def["job_wage"]
				ghoul["started_working_job"] = completion_time
				ghoul["job_start_game_time"] = world.time
				ghoul["job_days_paid"] = 0
			if(task_def["balance_bonus"])
				balance += task_def["balance_bonus"]
			UNTYPED_LIST_ADD(activity_log, list("text" = task_def["completion_text"] || "Completed task", "time" = completion_stamp, "outgoing" = FALSE))
		var/list/completed = ghoul["completed_tasks"]
		if(!islist(completed))
			completed = list()
			ghoul["completed_tasks"] = completed
		completed.Add(ghoul["current_task"])
		ghoul["current_task"] = ""
		ghoul["task_started"] = 0
		ghoul["task_duration"] = 0
		changed = TRUE
	if(changed)
		prefs.save_character()

/datum/ghoul_manager/proc/process_job_income(datum/preferences/prefs)
	var/changed = FALSE
	for(var/list/ghoul in ghouls)
		if(!ghoul["job_wage_amount"] || !ghoul["started_working_job"])
			continue
		var/days_elapsed = floor((world.realtime - ghoul["started_working_job"]) / 864000)
		var/days_paid = ghoul["job_days_paid"] || 0
		var/days_to_pay = days_elapsed - days_paid
		if(days_to_pay < 1)
			continue
		var/income = days_to_pay * ghoul["job_wage_amount"]
		balance += income
		ghoul["job_days_paid"] = days_elapsed
		var/list/activity_log = ghoul["activity"]
		var/payment_stamp = time2text((ghoul["job_start_game_time"] || world.time) + (days_elapsed * 864000), "Month DD, hh:mm")
		UNTYPED_LIST_ADD(activity_log, list("text" = "Job income: +$[income]", "time" = payment_stamp, "outgoing" = FALSE))
		changed = TRUE
	if(changed)
		prefs.save_character()

/datum/ghoul_manager/proc/outfit_presets()
	return list(
		list("outfit" = "bandit", "shoes" = "jackboots_work"),
		list("outfit" = "mechanic", "shoes" = "jackboots_work"),
		list("outfit" = "biker", "shoes" = "jackboots"),
		list("outfit" = "office", "shoes" = "business_shoes"),
		list("outfit" = "slickback", "shoes" = "business_shoes"),
		list("outfit" = "emo", "shoes" = "sneakers"),
		list("outfit" = "bar", "shoes" = "shoes"),
		list("outfit" = "dirty", "shoes" = "shoes_brown"),
		list("outfit" = "punk", "shoes" = "jackboots"),
		list("outfit" = "hoodie", "shoes" = "sneakers"),
		list("outfit" = "bouncer", "shoes" = "jackboots"),
		list("outfit" = "larry", "shoes" = "shoes"),
		list("outfit" = "sport", "shoes" = "sneakers"),
		list("outfit" = "turtleneck_black", "shoes" = "business_shoes"),
		list("outfit" = "guard", "shoes" = "jackboots"),
		list("outfit" = "homeless_m", "shoes" = "shoes_brown"),
	)

/datum/ghoul_manager/proc/generate_recruits()
	var/list/hair_options = list(
		"hair_buzzcut", "hair_crewcut", "hair_shorthair2", "hair_shorthair3",
		"hair_bob", "hair_messy", "hair_a", "hair_b", "hair_ponytail", "hair_bun",
	)
	var/list/hair_colors = list(
		"#1a1008", "#2b1d0e", "#3d2b1f", "#6b4226", "#8b1a1a",
		"#c8a96e", "#d4a855", "#002262", "#4a3728",
	)
	var/list/outfit_pool = outfit_presets()
	pending_recruits = list()
	for(var/i in 1 to 3)
		var/list/firstnames = prob(50) ? GLOB.first_names_male : GLOB.first_names_female
		var/name = "[pick(firstnames)] [pick(GLOB.last_names)]"
		var/hair = pick(hair_options)
		var/hair_color = pick(hair_colors)
		var/list/outfit = pick(outfit_pool)
		outfit_pool -= outfit
		var/recruit_personality = pick(list("passive", "emphatic", "scared"))
		UNTYPED_LIST_ADD(pending_recruits, list(
			"name" = name,
			"hair_style" = hair,
			"hair_color" = hair_color,
			"outfit" = outfit["outfit"],
			"shoes" = outfit["shoes"],
			"personality" = recruit_personality,
		))

/obj/item/smartphone/ui_data(mob/living/user)
	var/list/data = ..()
	var/kindred_splat = get_kindred_splat(user)
	data["is_kindred"] = !!kindred_splat
	if(kindred_splat && user.client?.prefs)
		var/datum/ghoul_manager/ghoul_manager = user.client.prefs.ghoul_manager
		if(ghoul_manager)
			if(!ghoul_manager.pending_recruits)
				ghoul_manager.generate_recruits()
			ghoul_manager.process_completed_tasks(user.client.prefs)
			ghoul_manager.process_job_income(user.client.prefs)
			data["ghoul_manager_balance"] = ghoul_manager.balance
			data["ghoul_manager_ghouls"] = ghoul_manager.ghouls
			data["ghoul_manager_recruits"] = ghoul_manager.pending_recruits
			data["ghoul_manager_tasks"] = ghoul_manager.task_list()
			data["current_realtime"] = world.realtime
	return data

/obj/item/smartphone/ui_act(action, params, datum/tgui/ui)
	. = ..()
	if(.)
		return
	var/datum/preferences/prefs = usr.client?.prefs
	var/datum/ghoul_manager/ghoul_manager = prefs?.ghoul_manager
	switch(action)
		if("ghoul_manager_deposit")
			if(!get_kindred_splat(usr) || !ghoul_manager)
				return FALSE
			var/amount = text2num(params["amount"])
			if(!amount || amount <= 0 || !ishuman(usr))
				return FALSE
			var/mob/living/carbon/human/manager_person = usr
			var/datum/bank_account/account = manager_person.account_id ? SSeconomy.bank_accounts_by_id["[manager_person.account_id]"] : null
			if(!account || !account.has_money(amount))
				to_chat(usr, span_warning("Insufficient funds!"))
				return FALSE
			var/deposited = round(amount * 0.6)
			if(!ghoul_manager.deposit_remaining || deposited > ghoul_manager.deposit_remaining)
				to_chat(usr, span_warning("Daily deposit limit reached. Resets every day at 8:00am."))
				return FALSE
			account.adjust_money(-amount, "Shr3kN3t M4n4g3m3nt deposit")
			ghoul_manager.balance += deposited
			ghoul_manager.deposit_remaining -= deposited
			prefs.save_character()
			to_chat(usr, span_notice("Transferred $[amount]. $[deposited] deposited after 40% fee. You can deposit $[ghoul_manager.deposit_remaining] more before hitting your daily deposit limit."))
			return TRUE

		if("ghoul_manager_recruit")
			if(!get_kindred_splat(usr) || !ghoul_manager || !ghoul_manager.pending_recruits)
				return FALSE
			var/list/chosen = null
			var/chosen_index = 0
			for(var/i in 1 to length(ghoul_manager.pending_recruits))
				var/list/recruit = ghoul_manager.pending_recruits[i]
				if(recruit["name"] == params["name"])
					chosen = recruit
					chosen_index = i
					break
			if(!chosen || ghoul_manager.find(chosen["name"]))
				return FALSE
			UNTYPED_LIST_ADD(ghoul_manager.ghouls, list(
				"name" = chosen["name"],
				"health_status" = "healthy",
				"current_task" = "",
				"talk_text" = "",
				"hair_style" = chosen["hair_style"],
				"hair_color" = chosen["hair_color"],
				"outfit" = chosen["outfit"],
				"shoes" = chosen["shoes"],
				"personality" = chosen["personality"],
				"mood" = 5,
				"task_started" = 0,
				"task_duration" = 0,
				"job_wage_amount" = 0,
				"started_working_job" = 0,
				"job_days_paid" = 0,
				"job_start_game_time" = 0,
				"completed_tasks" = list(),
			"activity" = list(list("text" = ghoul_manager.get_speech(chosen["personality"], "greeting"), "time" = time2text(world.time, "Month DD, hh:mm"), "outgoing" = FALSE)),
			))
			ghoul_manager.pending_recruits.Cut(chosen_index, chosen_index + 1)
			prefs.save_character()
			return TRUE

		if("ghoul_manager_assign_task")
			if(!get_kindred_splat(usr) || !ghoul_manager)
				return FALSE
			var/list/ghoul = ghoul_manager.find(params["name"])
			if(!ghoul)
				return FALSE
			if(ghoul["current_task"] && ghoul["task_started"] && world.realtime < ghoul["task_started"] + ghoul["task_duration"])
				return FALSE
			var/task_id = params["task_id"]
			var/list/task_def = null
			for(var/list/task in ghoul_manager.task_list())
				if(task["id"] == task_id)
					task_def = task
					break
			if(!task_def)
				return FALSE
			var/list/completed_check = ghoul["completed_tasks"]
			if(islist(completed_check) && completed_check.Find(task_id))
				return FALSE
			if(task_def["requires"] && !(islist(completed_check) && completed_check.Find(task_def["requires"])))
				return FALSE
			if(task_def["conflicts"] && islist(completed_check))
				var/conflicts = task_def["conflicts"]
				var/list/conflict_list = islist(conflicts) ? conflicts : list(conflicts)
				for(var/conflict in conflict_list)
					if(completed_check.Find(conflict))
						return FALSE
			var/duration = task_def["duration_hours"] * 36000
			ghoul["current_task"] = task_id
			ghoul["task_started"] = world.realtime
			ghoul["task_duration"] = duration
			ghoul["completion_stamp"] = time2text(world.time + duration, "Month DD, hh:mm")
			var/list/activity_log = ghoul["activity"]
			var/assign_stamp = time2text(world.time, "Month DD, hh:mm")
			UNTYPED_LIST_ADD(activity_log, list("text" = task_def["label"], "time" = assign_stamp, "outgoing" = TRUE))
			var/accept_text = ghoul_manager.get_speech(ghoul["personality"], "accept_task")
			ghoul["talk_text"] = accept_text
			if(accept_text)
				UNTYPED_LIST_ADD(activity_log, list("text" = accept_text, "time" = assign_stamp, "outgoing" = FALSE))
			prefs.save_character()
			return TRUE

		if("ghoul_manager_talk") // ghouls need enrichment, talk to them
			if(!get_kindred_splat(usr) || !ghoul_manager)
				return FALSE
			var/list/ghoul = ghoul_manager.find(params["name"])
			if(!ghoul)
				return FALSE
			if(!COOLDOWN_FINISHED(ghoul_manager, talk_cooldown))
				to_chat(usr, span_notice("Try again later."))
				return FALSE
			COOLDOWN_START(ghoul_manager, talk_cooldown, 10 SECONDS)
			var/talk_stamp = time2text(world.time, "Month DD, hh:mm")
			var/list/activity_log = ghoul["activity"]
			var/prompt = params["prompt"]
			if(prompt)
				UNTYPED_LIST_ADD(activity_log, list("text" = prompt, "time" = talk_stamp, "outgoing" = TRUE))
			var/greeting = ghoul_manager.get_speech(ghoul["personality"], "greeting")
			ghoul["talk_text"] = greeting
			if(greeting)
				UNTYPED_LIST_ADD(activity_log, list("text" = greeting, "time" = talk_stamp, "outgoing" = FALSE))
			prefs.save_character()
			return TRUE

		if("ghoul_manager_release")
			if(!get_kindred_splat(usr) || !ghoul_manager)
				return FALSE
			var/target_name = params["name"]
			var/ghoul_index = 0
			for(var/i in 1 to length(ghoul_manager.ghouls))
				var/list/g = ghoul_manager.ghouls[i]
				if(g["name"] == target_name)
					ghoul_index = i
					break
			if(!ghoul_index)
				return FALSE
			var/confirm = tgui_alert(usr, "Release [target_name]? This cannot be undone.", "Release Ghoul", list("Release", "Cancel"))
			if(confirm != "Release")
				return FALSE
			ghoul_manager.ghouls.Cut(ghoul_index, ghoul_index + 1)
			prefs.save_character()
			return TRUE
