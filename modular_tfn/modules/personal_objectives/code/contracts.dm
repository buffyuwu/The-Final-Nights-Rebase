// personal objectives phone app backend
/obj/item/smartphone/ui_data(mob/living/user)
	var/list/data = ..()
	if(!ishuman(user))
		return data

	var/mob/living/carbon/human/human_user = user
	var/datum/preferences/prefs = user.client?.prefs
	data["is_kindred"] = !!get_kindred_splat(user)
	var/list/active_types = list()
	if(LAZYLEN(human_user.personal_objectives))
		for(var/datum/personal_objective/obj in human_user.personal_objectives)
			active_types += obj.type

	var/list/pool = shuffle(subtypesof(/datum/personal_objective))
	var/list/available = list()
	for(var/obj_type in pool)
		if(obj_type in active_types)
			continue
		var/datum/personal_objective/temp = new obj_type()
		UNTYPED_LIST_ADD(available, list(
			"type" = "[obj_type]",
			"name" = temp.name,
			"summary" = temp.summary,
			"difficulty" = temp.difficulty,
		))
		qdel(temp)
		if(length(available) >= 3)
			break
	for(var/datum/player_contract/pc in GLOB.player_contracts)
		if(pc.claimer_mob)
			continue
		if(pc.poster_mob == human_user)
			continue
		UNTYPED_LIST_ADD(available, list(
			"type" = "player_[pc.id]",
			"name" = pc.name,
			"summary" = pc.description,
			"difficulty" = 0,
			"is_player_contract" = TRUE,
			"poster" = pc.poster_name,
			"reward" = pc.reward,
			"player_contract_id" = pc.id,
		))
	data["available_contracts"] = available
	var/list/active = list()
	if(LAZYLEN(human_user.personal_objectives))
		for(var/datum/personal_objective/obj in human_user.personal_objectives)
			UNTYPED_LIST_ADD(active, list(
				"name" = obj.name,
				"description" = obj.description,
				"difficulty" = obj.difficulty,
				"progress" = obj.get_progress_text(),
				"completed" = obj.completed,
			))
	for(var/datum/player_contract/pc in GLOB.player_contracts)
		if(pc.claimer_mob != human_user)
			continue
		UNTYPED_LIST_ADD(active, list(
			"name" = pc.name,
			"description" = pc.description,
			"difficulty" = 0,
			"progress" = null,
			"completed" = FALSE,
			"is_player_contract" = TRUE,
			"reward" = pc.reward,
			"poster" = pc.poster_name,
		))
	data["active_contracts"] = active
	var/datum/player_contract/my_posted = null
	for(var/datum/player_contract/pc in GLOB.player_contracts)
		if(pc.poster_mob == human_user)
			my_posted = pc
			break
	if(my_posted)
		data["my_posted_contract"] = list(
			"id" = my_posted.id,
			"name" = my_posted.name,
			"description" = my_posted.description,
			"reward" = my_posted.reward,
			"claimer_name" = my_posted.claimer_name,
			"is_claimed" = !!my_posted.claimer_mob,
		)
	else
		data["my_posted_contract"] = null

	var/current_triumphs = prefs ? prefs.read_preference(/datum/preference/numeric/triumphs) : 0
	data["triumphs"] = current_triumphs

	var/username = prefs ? prefs.read_preference(/datum/preference/text/shr3knet_username) : ""
	data["shr3knet_username"] = username
	var/list/leaderboard = list()
	for(var/client/C in GLOB.clients)
		if(!C.prefs)
			continue
		var/entry_name = C.prefs.read_preference(/datum/preference/text/shr3knet_username)
		if(!entry_name || entry_name == "")
			continue
		var/entry_score = C.prefs.read_preference(/datum/preference/numeric/triumphs)
		UNTYPED_LIST_ADD(leaderboard, list(
			"username" = entry_name,
			"triumphs" = entry_score,
			"is_self" = (C == user.client),
		))
	data["leaderboard"] = leaderboard

	return data

/obj/item/smartphone/ui_act(action, params, datum/tgui/ui)
	. = ..()
	if(.)
		return
	switch(action)
		if("accept_contract")
			if(!ishuman(usr))
				return FALSE
			var/mob/living/carbon/human/human_user = usr
			var/obj_type = text2path(params["type"])
			if(!obj_type || !ispath(obj_type, /datum/personal_objective))
				return FALSE
			if(LAZYLEN(human_user.personal_objectives))
				for(var/datum/personal_objective/existing in human_user.personal_objectives)
					if(existing.type == obj_type)
						return FALSE
			var/datum/personal_objective/obj = new obj_type()
			obj.setup(human_user)
			LAZYINITLIST(human_user.personal_objectives)
			human_user.personal_objectives += obj
			to_chat(usr, span_notice("Contract accepted: [obj.description]"))
			return TRUE

		if("set_shr3knet_username")
			var/datum/preferences/prefs = usr.client?.prefs
			if(!prefs)
				return FALSE
			var/new_name = trim(sanitize(params["username"] || ""))
			if(!new_name || length(new_name) > 32)
				return FALSE
			var/existing = prefs.read_preference(/datum/preference/text/shr3knet_username)
			// changing an existing username costs 5 triumphs
			if(existing && existing != "")
				var/current = prefs.read_preference(/datum/preference/numeric/triumphs)
				if(current < 5)
					to_chat(usr, span_warning("Changing your username costs 5 triumphs. You have [current]."))
					return FALSE
				prefs.write_preference(GLOB.preference_entries[/datum/preference/numeric/triumphs], current - 5)
			prefs.write_preference(GLOB.preference_entries[/datum/preference/text/shr3knet_username], new_name)
			prefs.save_character()
			to_chat(usr, span_notice("Shr3kNet username set to: [new_name]"))
			return TRUE

		if("post_contract")
			if(!ishuman(usr))
				return FALSE
			var/mob/living/carbon/human/poster = usr
			for(var/datum/player_contract/existing in GLOB.player_contracts)
				if(existing.poster_mob == poster)
					to_chat(usr, span_warning("You already have a contract posted."))
					return FALSE
			var/contract_name = trim(sanitize(params["name"] || ""))
			var/contract_desc = trim(sanitize(params["description"] || ""))
			var/contract_reward = text2num(params["reward"])
			if(!contract_name || length(contract_name) > 50)
				return FALSE
			if(!contract_desc || length(contract_desc) > 200)
				return FALSE
			if(isnull(contract_reward) || contract_reward < 1)
				return FALSE
			contract_reward = round(contract_reward)
			var/datum/preferences/poster_prefs = usr.client?.prefs
			if(!poster_prefs)
				return FALSE
			var/current_triumphs = poster_prefs.read_preference(/datum/preference/numeric/triumphs)
			if(contract_reward > current_triumphs)
				to_chat(usr, span_warning("Reward exceeds your triumph balance ([current_triumphs])."))
				return FALSE
			GLOB.player_contract_id_counter += 1
			var/datum/player_contract/pc = new()
			pc.id = GLOB.player_contract_id_counter
			pc.name = contract_name
			pc.description = contract_desc
			pc.reward = contract_reward
			pc.setup(poster)
			GLOB.player_contracts += pc
			to_chat(usr, span_notice("Contract posted: [contract_name]"))
			return TRUE

		if("remove_posted_contract")
			if(!ishuman(usr))
				return FALSE
			var/mob/living/carbon/human/human_usr = usr
			for(var/datum/player_contract/pc in GLOB.player_contracts)
				if(pc.poster_mob != human_usr)
					continue
				if(pc.claimer_mob)
					to_chat(pc.claimer_mob, span_warning("The contract '[pc.name]' was removed by the poster."))
				GLOB.player_contracts -= pc
				qdel(pc)
				to_chat(usr, span_notice("Contract removed."))
				return TRUE
			return FALSE

		if("complete_posted_contract")
			if(!ishuman(usr))
				return FALSE
			var/mob/living/carbon/human/human_usr = usr
			var/datum/player_contract/my_contract = null
			for(var/datum/player_contract/pc in GLOB.player_contracts)
				if(pc.poster_mob == human_usr)
					my_contract = pc
					break
			if(!my_contract || !my_contract.claimer_mob)
				to_chat(usr, span_warning("No one has claimed this contract."))
				return FALSE
			var/datum/preferences/claimer_prefs = my_contract.claimer_mob.client?.prefs
			if(!claimer_prefs)
				to_chat(usr, span_warning("The claimer must be online to receive the reward."))
				return FALSE
			var/datum/preferences/poster_prefs = usr.client?.prefs
			if(!poster_prefs)
				return FALSE
			var/poster_triumphs = poster_prefs.read_preference(/datum/preference/numeric/triumphs)
			if(poster_triumphs < my_contract.reward)
				to_chat(usr, span_warning("You no longer have enough triumphs (need [my_contract.reward], have [poster_triumphs])."))
				return FALSE
			poster_prefs.write_preference(GLOB.preference_entries[/datum/preference/numeric/triumphs], poster_triumphs - my_contract.reward)
			poster_prefs.save_character()
			var/claimer_triumphs = claimer_prefs.read_preference(/datum/preference/numeric/triumphs)
			claimer_prefs.write_preference(GLOB.preference_entries[/datum/preference/numeric/triumphs], claimer_triumphs + my_contract.reward)
			claimer_prefs.save_character()
			to_chat(usr, span_notice("Contract completed! [my_contract.reward] triumphs deducted."))
			to_chat(my_contract.claimer_mob, span_greentext("Contract '[my_contract.name]' completed! You received [my_contract.reward] triumphs."))
			GLOB.player_contracts -= my_contract
			qdel(my_contract)
			return TRUE

		if("claim_player_contract")
			if(!ishuman(usr))
				return FALSE
			var/mob/living/carbon/human/claimer = usr
			var/contract_id = text2num(params["id"])
			if(isnull(contract_id))
				return FALSE
			var/datum/player_contract/found = null
			for(var/datum/player_contract/pc in GLOB.player_contracts)
				if(pc.id == contract_id)
					found = pc
					break
			if(!found || found.claimer_mob || found.poster_mob == claimer)
				return FALSE
			found.set_claimer(claimer)
			to_chat(usr, span_notice("Contract claimed: [found.description]"))
			return TRUE
