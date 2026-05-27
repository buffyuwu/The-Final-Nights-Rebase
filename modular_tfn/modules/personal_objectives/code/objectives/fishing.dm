// catch a random number of fish
/datum/personal_objective/fishing
	name = "angler"
	summary = "catch a number of fish"
	difficulty = 2
	var/target_count = 0
	var/current_count = 0

/datum/personal_objective/fishing/setup(mob/living/carbon/human/mob)
	. = ..()
	target_count = rand(5, 25)
	description = "Catch [target_count] fish."
	RegisterSignal(mob, COMSIG_MOB_COMPLETE_FISHING, PROC_REF(on_fishing_complete))

/datum/personal_objective/fishing/teardown()
	UnregisterSignal(owner_mob, COMSIG_MOB_COMPLETE_FISHING)
	. = ..()

/datum/personal_objective/fishing/get_progress_text()
	return "[current_count]/[target_count]"

/datum/personal_objective/fishing/proc/on_fishing_complete(mob/living/source, datum/fishing_challenge/challenge, win)
	SIGNAL_HANDLER
	if(!win)
		return
	if(!ispath(challenge?.reward_path, /obj/item/fish))
		return
	current_count++
	to_chat(source, span_greentext("Fish caught: [current_count]/[target_count]"))
	if(current_count >= target_count)
		on_complete()
