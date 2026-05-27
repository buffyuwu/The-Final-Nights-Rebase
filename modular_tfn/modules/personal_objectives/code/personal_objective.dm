// because its more fun with a purpose
/datum/personal_objective
	var/name = "objective"
	var/description = "complete the objective"
	var/summary = "complete an objective" // shown in the contracts list before accepting
	var/difficulty = 1 // 1 (easy) to 3 (hard)
	var/completed = FALSE
	var/mob/living/carbon/human/owner_mob

/datum/personal_objective/proc/setup(mob/living/carbon/human/mob)
	owner_mob = mob

/datum/personal_objective/proc/teardown()
	owner_mob = null

/datum/personal_objective/proc/get_progress_text()
	return null

/datum/personal_objective/proc/on_complete()
	if(completed)
		return
	completed = TRUE
	if(!owner_mob?.client?.prefs)
		return
	var/datum/preferences/prefs = owner_mob.client.prefs
	var/current = prefs.read_preference(/datum/preference/numeric/triumphs)
	prefs.write_preference(GLOB.preference_entries[/datum/preference/numeric/triumphs], current + difficulty)
	prefs.save_character()
	to_chat(owner_mob, span_greentext("Contract complete: [name]. [difficulty] triumph[difficulty != 1 ? "s" : ""] earned."))

/mob/living/carbon/human
	var/list/personal_objectives
