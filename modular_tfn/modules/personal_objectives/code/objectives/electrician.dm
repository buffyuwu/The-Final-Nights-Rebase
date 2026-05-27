// successfully repair fuse boxes with wirecutters
/datum/personal_objective/electrician
	name = "electrician"
	summary = "repair fuse boxes with wirecutters"
	difficulty = 2
	var/target_count = 0
	var/current_count = 0

/datum/personal_objective/electrician/setup(mob/living/carbon/human/mob)
	. = ..()
	target_count = rand(1, 3)
	description = "Use wirecutters on [target_count] fuse box[target_count != 1 ? "es" : ""]."
	RegisterSignal(mob, COMSIG_FUSEBOX_REPAIRED, PROC_REF(on_fusebox_repaired))

/datum/personal_objective/electrician/teardown()
	UnregisterSignal(owner_mob, COMSIG_FUSEBOX_REPAIRED)
	. = ..()

/datum/personal_objective/electrician/get_progress_text()
	return "[current_count]/[target_count]"

/datum/personal_objective/electrician/proc/on_fusebox_repaired(mob/living/source)
	SIGNAL_HANDLER
	current_count++
	to_chat(source, span_greentext("Fuse boxes repaired: [current_count]/[target_count]"))
	if(current_count >= target_count)
		on_complete()
