/datum/atom_hud/data/auspex_aura
	hud_icons = list(AUSPEX_AURA_HUD)

/particles/smoke/aura
	count = 1024
	spawning = 6
	lifespan = 2 SECONDS
	fade = 2 SECONDS
	fadein = 0.25 SECONDS
	gravity = list(0, 0, 0)
	friction = 0.05
	velocity = generator(GEN_SPHERE, 0, 1, UNIFORM_RAND)
	drift = list(0, 0, 0)
	position = generator(GEN_BOX, list(-8, -8, 0), list(10, 10, 0), UNIFORM_RAND)
	scale = list(0.75, 0.75)
	grow = 0.015
	color = "#ffffff62"

/datum/component/aura
	// A list of currently selected emotions by the player
	var/current_aura = AURA_INNOCENT
	var/obj/effect/abstract/shared_particle_holder/aura_smoke

/datum/component/aura/RegisterWithParent()
	. = ..()
	var/mob/parent_mob = parent
	var/datum/atom_hud/data/auspex_aura/target_hud = GLOB.huds[DATA_HUD_AUSPEX_AURAS]
	target_hud.add_atom_to_hud(parent_mob)

	add_verb(parent_mob, /mob/verb/emotion_panel)
	RegisterSignal(parent_mob, COMSIG_MOB_EMOTION_CHANGED, PROC_REF(update_emotions))
	RegisterSignal(parent_mob, COMSIG_MOB_UPDATE_AURA, PROC_REF(update_aura))
	update_aura()

/datum/component/aura/UnregisterFromParent()
	var/mob/parent_mob = parent
	var/datum/atom_hud/data/auspex_aura/target_hud = GLOB.huds[DATA_HUD_AUSPEX_AURAS]
	target_hud.remove_atom_from_hud(parent_mob)

	remove_verb(parent_mob, /mob/verb/emotion_panel)
	UnregisterSignal(parent_mob, list(COMSIG_MOB_EMOTION_CHANGED, COMSIG_MOB_UPDATE_AURA))
	QDEL_NULL(aura_smoke)
	return ..()

/datum/component/aura/proc/update_emotions(mob/changed_mob, new_emotion)
	SIGNAL_HANDLER

	if(current_aura == new_emotion)
		return

	current_aura = GLOB.aura_list[new_emotion]
	update_aura()

/datum/component/aura/proc/update_aura()
	SIGNAL_HANDLER

	var/mob/parent_mob = parent
	var/image/holder = parent_mob.hud_list[AUSPEX_AURA_HUD]
	if(!holder)
		holder = new
	if(!aura_smoke)
		aura_smoke = new /obj/effect/abstract/shared_particle_holder(null, /particles/smoke/aura)
		holder.vis_contents += aura_smoke
	var/mutable_appearance/aura_appearance = mutable_appearance('modular_darkpack/modules/powers/icons/auras.dmi', "aura", ABOVE_MOB_LAYER, parent_mob, GAME_PLANE)
	update_aura_colors(aura_appearance, holder)
	update_aura_overlays(aura_appearance, holder)
	update_aura_filters(aura_appearance, holder)

/datum/component/aura/proc/is_color(input_text)
	if(findtext(input_text, GLOB.is_color))
		return TRUE
	return FALSE

/datum/component/aura/proc/update_aura_colors(mutable_appearance/aura_appearance, image/holder)
	var/output_color
	if(is_color(current_aura))
		output_color = current_aura
	else
		output_color = null

	aura_appearance.color = output_color

	if(aura_smoke)
		aura_smoke.particles.color = output_color ? (output_color + pick("20","30")) : "#ffffff09"

	holder.icon = null
	holder.icon_state = null
	holder.color = null

	var/mob/parent_mob = parent
	if(iskindred(parent_mob) && output_color)
		var/list/hsv_color_value = rgb2hsv(output_color)
		hsv_color_value[2] = hsv_color_value[2] * 0.7 // Reduce saturation for kindred
		aura_appearance.color = hsv2rgb(hsv_color_value)

	// DARKPACK TODO - aura still needs real sprites.
	if(HAS_TRAIT(parent_mob, TRAIT_FRENETIC_AURA))
		var/list/hsv_color_value = rgb2hsv(aura_appearance.color || "#ffffff")
		hsv_color_value[2] = hsv_color_value[2] * 1.5 // Way brighter for shapeshifters
		aura_appearance.color = hsv2rgb(hsv_color_value)
		aura_appearance.icon_state = "old_aura_bright"


/datum/component/aura/proc/update_aura_overlays(mutable_appearance/aura_appearance, image/holder)
	holder.cut_overlays()
	var/mob/parent_mob = parent

	aura_appearance.transform = matrix(0.5, MATRIX_SCALE)
	aura_appearance.alpha = 175
	holder.add_overlay(aura_appearance)
	var/mutable_appearance/blank_overlay = mutable_appearance('icons/effects/effects.dmi', "blank_white", ABOVE_MOB_LAYER+4.01, parent_mob, GAME_PLANE)
	blank_overlay.alpha = 75
	blank_overlay.color = aura_appearance.color
	holder.add_overlay(blank_overlay)
	var/mutable_appearance/smoke_overlay = mutable_appearance('modular_darkpack/modules/powers/icons/auras.dmi', "smoke", ABOVE_MOB_LAYER+4.02, parent_mob, GAME_PLANE)
	smoke_overlay.alpha = 50
	smoke_overlay.color = aura_appearance.color
	var/matrix/smoke_transform = matrix()
	smoke_transform.Scale(1, pick(1.25,1.5))
	smoke_overlay.transform = smoke_transform
	var/mutable_appearance/classic_aura = mutable_appearance('modular_darkpack/modules/powers/icons/auras.dmi', "old_aura", ABOVE_MOB_LAYER+4.03, parent_mob, GAME_PLANE)
	classic_aura.alpha = 155
	classic_aura.color = aura_appearance.color

	if(HAS_TRAIT(parent_mob, TRAIT_DIABLERIE))
		var/image/diablerie_image = image('modular_darkpack/modules/powers/icons/auras.dmi', parent_mob, "diab", ABOVE_MOB_LAYER+1)
		holder.add_overlay(diablerie_image)
		blank_overlay.color = "#1717178b"

	if(current_aura == AURA_ANXIOUS)
		var/icon/temporary_icon_holder = icon('modular_darkpack/modules/powers/icons/auras.dmi', "smoke")
		var/icon/static_icon = getStaticIcon(temporary_icon_holder)
		var/mutable_appearance/static_image = mutable_appearance(static_icon, "smoke", ABOVE_MOB_LAYER+2, parent_mob, GAME_PLANE)
		static_image.appearance_flags |= RESET_COLOR
		static_image.alpha = 150
		holder.add_overlay(static_image)

	if(isghoul(parent_mob))
		var/list/hsv_color_value = rgb2hsv(aura_appearance.color)
		hsv_color_value[2] = hsv_color_value[2] * 0.7 // Reduce saturation for ghouls
		smoke_overlay.color = hsv2rgb(hsv_color_value)
		classic_aura.icon_state = "old_aura_ghoul"

	if(isavatar(parent_mob) || isobserver(parent_mob))
		holder.opacity = holder.opacity * 0.5

	var/matrix/classic_aura_transform = matrix()
	classic_aura_transform.Scale(pick(0.55,0.65), 1)
	classic_aura.transform = classic_aura_transform
	smoke_overlay.transform = smoke_transform
	holder.add_overlay(classic_aura)
	holder.add_overlay(smoke_overlay)

/datum/component/aura/proc/update_aura_filters(mutable_appearance/aura_appearance, image/holder)
	remove_wibbly_filters(holder)
	apply_wibbly_filters(holder)
