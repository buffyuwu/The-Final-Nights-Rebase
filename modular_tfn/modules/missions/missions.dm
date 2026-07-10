// offmap missions to earn persistent reward currency
GLOBAL_LIST_EMPTY(mission_spawnpoints)
/obj/effect/landmark/mission/alpha
	name = "Alpha Mission Landmark"

/obj/effect/landmark/mission/alpha/Initialize(mapload)
	..()
	GLOB.mission_spawnpoints += loc
	return INITIALIZE_HINT_QDEL

/client/verb/debug_gotomissionalpha()
	set name = "Guide"
	set category = "Buffy"
	set desc = "Debug"
	mob.forceMove(pick(GLOB.mission_spawnpoints))
	to_chat(mob, span_adminnotice("You have been sent to the Alpha Mission!"), confidential = TRUE)
