#define BABYLON_SERVER_PORT 2567
#define BABYLON_INTERNAL_PORT 2568

/client/var/babylon_overlay_active = FALSE

/client/proc/get_babylon_server_url()
	var/host = CONFIG_GET(string/public_address)
	if(!host)
		host = CONFIG_GET(string/server)
	if(!host)
		host = world.internet_address
	if(!host)
		host = world.address
	if(!host)
		host = "localhost"
	var/colon_index = findtext(host, ":")
	if(colon_index)
		host = copytext(host, 1, colon_index)
	return "ws://[host]:[BABYLON_SERVER_PORT]"

/client/proc/get_babylon_shell_html()
	var/dat = {"<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="index.css">
</head>
<body>
<canvas id="renderer"></canvas>
<div id="chatLog" class="chat-log"></div>
<div id="chatBar" class="chat-bar">
<input id="chatInput" type="text" maxlength="300" autocomplete="off">
</div>
<script>
window.__BABYLON_SERVER_URL__ = "[get_babylon_server_url()]";
window.__BABYLON_PLAYER_CKEY__ = "[ckey]";
</script>
<script src="index.js"></script>
</body>
</html>
"}
	return dat

/datum/asset/simple/babylon_overlay
	keep_local_name = TRUE
	assets = list(
		"index.js" = file("babylon_client/dist/index.js"),
		"index.css" = file("babylon_client/dist/index.css"),
		"character.glb" = file("babylon_client/dist/character.glb"),
		"HavokPhysics.wasm" = file("babylon_client/dist/HavokPhysics.wasm"),
		"1.chunk.js" = file("babylon_client/dist/1.chunk.js"),
	)

/client/proc/show_babylon_overlay()
	if(babylon_overlay_active)
		return
	babylon_overlay_active = TRUE
	var/datum/asset/assets = get_asset_datum(/datum/asset/simple/babylon_overlay)
	assets.send(src)
	winset(src, "tfn_babylon_browser", "is-disabled=false;is-visible=true")
	src << browse(get_babylon_shell_html(), "window=tfn_babylon_browser")

/client/proc/hide_babylon_overlay()
	if(!babylon_overlay_active)
		return
	babylon_overlay_active = FALSE
	winset(src, "tfn_babylon_browser", "is-disabled=true;is-visible=false")

/client/verb/toggle_babylon_overlay()
	set name = "Toggle 3D View"
	set category = "OOC"
	if(babylon_overlay_active)
		hide_babylon_overlay()
	else
		show_babylon_overlay()

SUBSYSTEM_DEF(babylon_chat)
	name = "Babylon Chat"
	wait = 0.5 SECONDS
	ss_flags = SS_NO_INIT

/datum/controller/subsystem/babylon_chat/fire()
	var/list/response = world.Export("http://127.0.0.1:[BABYLON_INTERNAL_PORT]/pending-chat")
	if(!response)
		return
	var/list/entries = json_decode(file2text(response["CONTENT"]))
	if(!islist(entries))
		return
	for(var/list/entry in entries)
		var/entry_ckey = entry["ckey"]
		var/entry_message = entry["message"]
		if(!entry_ckey || !entry_message)
			continue
		var/client/target = GLOB.directory[entry_ckey]
		if(!target?.mob)
			continue
		target.mob.say(entry_message)

#undef BABYLON_SERVER_PORT
#undef BABYLON_INTERNAL_PORT
