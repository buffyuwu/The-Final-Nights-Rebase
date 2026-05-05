// speech line lists for ghoul personalities.
// get_speech(personality, speech_type) picks a random line from the matching list.
// speech_type: "greeting", "accept_task"

/datum/ghoul_manager/proc/get_speech(personality, speech_type)
	var/list/phrases
	switch(speech_type)
		if("greeting")
			switch(personality)
				if("passive")
					phrases = list(
						"hey.",
						"oh, hi.",
						"hey!",
						"ready to go.",
						"life's not so bad.",
						"this used to be such a nice town",
						"what's up.",
						"oh, hi!",
						"needed a break anyway",
						"you checking in on me?",
						"yeah. hi.",
						"a little tired",
					)
				if("emphatic")
					phrases = list(
						"Hi! It's good to see you!",
						"Thanks for everything...",
						"Hey!! Hi!!",
						"Ready to go!",
						"I was just thinking about you!",
						"Can I have some more of that... Stuff?",
						"Oh thank GOD you're here.",
						"YES. Hi. Hello!",
						"I have been WAITING.",
						"You always show up at the right time!",
						"Okay okay okay, hi!",
						"Is it weird that I missed you? It feels weird.",
					)
				if("scared")
					phrases = list(
						"please don't hurt me...",
						"h-hi...",
						"oh, it's you... h-hi!",
						"i haven't been sleeping much...",
						"hi!",
						"sorry!-- hi.",
						"i keep hearing things at night.",
						"is everything okay? are we okay?",
						"oh. hi. sorry, i was jumpy.",
						"i'm fine. i'm totally fine.",
						"...you're not mad at me, right?",
						"hi. yeah. still here.",
					)
		if("accept_task")
			switch(personality)
				if("passive")
					phrases = list(
						"of course.",
						"i'll handle it.",
						"understood.",
						"right away.",
						"okay.",
						"sure.",
						"on it.",
						"yeah, that's fine.",
						"already thinking about it.",
						"no problem.",
						"got it.",
						"fine by me.",
					)
				if("emphatic")
					phrases = list(
						"ON IT!",
						"Yeah! Let's go!",
						"Can't wait!",
						"Consider it DONE. DOOONE!",
						"I'm so ready for this.",
						"You can count on me!",
						"ABSOLUTELY.",
						"I've been waiting for something to do!",
						"Watch me. Just WATCH me.",
						"I will not let you down!",
						"This is going to be great!",
						"Say less. I'm already gone.",
					)
				if("scared")
					phrases = list(
						"o-okay... i'll try.",
						"sure... i hope it goes okay.",
						"got it. i'll be careful.",
						"okay. i can do this... i think.",
						"right. okay. here i go.",
						"i'll be fine... right?",
						"okay. yeah. i'll do it.",
						"what if something goes wrong?",
						"...okay. for you.",
						"i'll try my best. that's all i can promise.",
						"just... don't forget about me, okay?",
						"okay okay okay. i'm going.",
					)
	if(!phrases || !length(phrases))
		return ""
	return pick(phrases)
