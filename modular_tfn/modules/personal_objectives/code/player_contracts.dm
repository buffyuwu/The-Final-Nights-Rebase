// player-posted bounty contracts stored globally for the round
GLOBAL_LIST_EMPTY(player_contracts)
GLOBAL_VAR_INIT(player_contract_id_counter, 0)

/datum/player_contract
	var/id = 0
	var/mob/living/carbon/human/poster_mob
	var/poster_name = ""
	var/name = ""
	var/description = ""
	var/reward = 0
	var/mob/living/carbon/human/claimer_mob
	var/claimer_name = null

/datum/player_contract/proc/setup(mob/living/carbon/human/poster)
	poster_mob = poster
	poster_name = poster.real_name
	RegisterSignal(poster_mob, COMSIG_PARENT_QDELETING, PROC_REF(on_poster_deleted))

/datum/player_contract/proc/set_claimer(mob/living/carbon/human/claimer)
	if(claimer_mob)
		UnregisterSignal(claimer_mob, COMSIG_PARENT_QDELETING)
	claimer_mob = claimer
	claimer_name = claimer.real_name
	RegisterSignal(claimer_mob, COMSIG_PARENT_QDELETING, PROC_REF(on_claimer_deleted))

/datum/player_contract/proc/on_poster_deleted()
	SIGNAL_HANDLER
	poster_mob = null
	GLOB.player_contracts -= src
	qdel(src)

/datum/player_contract/proc/on_claimer_deleted()
	SIGNAL_HANDLER
	claimer_mob = null
	claimer_name = null

/datum/player_contract/Destroy()
	if(poster_mob)
		UnregisterSignal(poster_mob, COMSIG_PARENT_QDELETING)
		poster_mob = null
	if(claimer_mob)
		UnregisterSignal(claimer_mob, COMSIG_PARENT_QDELETING)
		claimer_mob = null
	return ..()
