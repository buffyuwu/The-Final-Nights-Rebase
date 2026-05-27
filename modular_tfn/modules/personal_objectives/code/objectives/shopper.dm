// buy a random number of clothing items from any retail vendor
/datum/personal_objective/shopper
	name = "outfit therapy"
	summary = "Buy clothes from a clothing store"
	difficulty = 1
	var/target_count = 0
	var/current_count = 0

/datum/personal_objective/shopper/setup(mob/living/carbon/human/mob)
	. = ..()
	target_count = rand(3, 8)
	description = "Buy [target_count] clothing items."
	RegisterSignal(mob, COMSIG_RETAIL_ITEM_PURCHASED, PROC_REF(on_item_purchased))

/datum/personal_objective/shopper/teardown()
	UnregisterSignal(owner_mob, COMSIG_RETAIL_ITEM_PURCHASED)
	. = ..()

/datum/personal_objective/shopper/get_progress_text()
	return "[current_count]/[target_count]"

/datum/personal_objective/shopper/proc/on_item_purchased(mob/living/source, product_path)
	SIGNAL_HANDLER
	if(!ispath(product_path, /obj/item/clothing))
		return
	current_count++
	to_chat(source, span_greentext("Clothing purchased: [current_count]/[target_count]"))
	if(current_count >= target_count)
		on_complete()
