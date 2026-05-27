// for use in the personal objectives system
/datum/preference/numeric/triumphs
	savefile_key = "triumphs"
	savefile_identifier = PREFERENCE_PLAYER
	minimum = 0
	maximum = 999

/datum/preference/numeric/triumphs/create_default_value()
	return 0

// display name on the shr3knet leaderboard. null means unregistered
/datum/preference/text/shr3knet_username
	savefile_key = "shr3knet_username"
	savefile_identifier = PREFERENCE_PLAYER
	maximum_value_length = 32

/datum/preference/text/shr3knet_username/create_default_value()
	return null

/datum/preference/text/shr3knet_username/deserialize(input, datum/preferences/preferences)
	if(isnull(input))
		return null
	return ..()

/datum/preference/text/shr3knet_username/is_valid(value, datum/preferences/preferences)
	if(isnull(value))
		return TRUE
	return ..()
