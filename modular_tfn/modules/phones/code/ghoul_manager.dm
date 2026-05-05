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

/datum/ghoul_manager/proc/find(name)
	for(var/list/ghoul in ghouls)
		if(ghoul["name"] == name)
			return ghoul

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
	var/list/outfit_pool = outfit_presets()
	pending_recruits = list()
	for(var/i in 1 to 3)
		var/list/firstnames = prob(50) ? GLOB.first_names_male : GLOB.first_names_female
		var/name = "[pick(firstnames)] [pick(GLOB.last_names)]"
		var/hair = pick(hair_options)
		var/list/outfit = pick(outfit_pool)
		outfit_pool -= outfit
		UNTYPED_LIST_ADD(pending_recruits, list(
			"name" = name,
			"hair_style" = hair,
			"outfit" = outfit["outfit"],
			"shoes" = outfit["shoes"],
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
			data["ghoul_manager_balance"] = ghoul_manager.balance
			data["ghoul_manager_ghouls"] = ghoul_manager.ghouls
			data["ghoul_manager_recruits"] = ghoul_manager.pending_recruits
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
				to_chat(usr, span_warning("insufficient funds."))
				return FALSE
			account.adjust_money(-amount, "Shr3kN3t M4n4g3m3nt deposit")
			var/deposited = round(amount * 0.6)
			ghoul_manager.balance += deposited
			prefs.save_character()
			to_chat(usr, span_notice("transferred $[amount]. $[deposited] deposited after 40% fee."))
			return TRUE

		if("ghoul_manager_recruit")
			if(!get_kindred_splat(usr) || !ghoul_manager || !ghoul_manager.pending_recruits)
				return FALSE
			var/list/chosen = null
			for(var/list/recruit in ghoul_manager.pending_recruits)
				if(recruit["name"] == params["name"])
					chosen = recruit
					break
			if(!chosen || ghoul_manager.find(chosen["name"]))
				return FALSE
			UNTYPED_LIST_ADD(ghoul_manager.ghouls, list(
				"name" = chosen["name"],
				"health_status" = "healthy",
				"current_task" = "",
				"talk_text" = "",
				"hair_style" = chosen["hair_style"],
				"outfit" = chosen["outfit"],
				"shoes" = chosen["shoes"],
			))
			ghoul_manager.pending_recruits.Remove(chosen)
			prefs.save_character()
			return TRUE

		if("ghoul_manager_assign_task")
			if(!get_kindred_splat(usr) || !ghoul_manager)
				return FALSE
			var/list/ghoul = ghoul_manager.find(params["name"])
			if(!ghoul)
				return FALSE
			var/task = "foo"
			// todo
			ghoul["current_task"] = sanitize(task)
			prefs.save_character()
			return TRUE

		if("ghoul_manager_talk")
			if(!get_kindred_splat(usr) || !ghoul_manager)
				return FALSE
			var/list/ghoul = ghoul_manager.find(params["name"])
			if(!ghoul)
				return FALSE
			ghoul["talk_text"] = "Hello!"
			prefs.save_character()
			return TRUE

		if("ghoul_manager_set_health")
			if(!get_kindred_splat(usr) || !ghoul_manager)
				return FALSE
			var/new_status = params["status"]
			if(!(new_status in list("healthy", "injured", "incapacitated")))
				return FALSE
			var/list/ghoul = ghoul_manager.find(params["name"])
			if(!ghoul)
				return FALSE
			ghoul["health_status"] = new_status
			prefs.save_character()
			return TRUE
