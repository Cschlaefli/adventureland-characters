var mode = 1
var hunting_ground = "";
var hunting = "arcticbee";

var party_leader = true
var targets = []

var invis = false
game.on("hit", function(data){
	if(data.target === character.id || char_list.includes(data.actor) || data.actor === "Celery") return;
	if(char_list.includes(data.target) && data.source == "attack"){
		log(data.actor);
		//change_target(get_monster(data.actor));
	}
});

function attack_mode()
{
	let active = get_active_characters();
	for( var x in active) { if(active[x] === "disconnected") start_alts(); }
	if( Object.keys(get_active_characters()).length < 3) start_alts();
	modes.default = modes.attack;
	var target=get_targeted_monster();
	//targets.filter( e => e).sort( (a,b) => a.hp - b.hp);
	
	hp_mp(0.3 , 0.5);
	
	if(!target)
	{
		
		update_pot_count();
		if (min(hp_count, mp_count) < min_pots)
		{
			mode = modes.buying;
			use("town", character);
			return
		}
		/*
		let mon = visible_monsters();
		mon = mon.filter( m => m.xp >= 100 && m.attack <= 400 && (!m.target || char_list.includes(m.target)))
			.sort( (a,b) => parent.distance(character, a) - parent.distance(character, b));
		if (mon.length > 0) target = mon[0];
		*/
		//let x =get_nearest_hostile();
		
		target= get_nearest_monster({min_xp:100,max_att:400,type:hunting});
		if(target){
			set_message("Targeted "+target.name);
			change_target(target);
			target_xp = target.xp
			target_time = new Date();
			hp_used = 0;
			mp_used = 0;
		}
		else
		{
			mode = modes.moving;
			set_message("No Monsters");
			return;
		}
	}

	kite_attack(target)
/*	
	if(!in_attack_range(target))
	{
		move(
			character.x+(target.x-character.x)/2,
			character.y+(target.y-character.y)/2
			);
	}
	else if(can_attack(target))
	{
		quickskill("quickpunch", target)
		invis = invis || quickskill("invis")
		set_message("Attacking");
		attack(target);
	}
	*/
}


function kite_attack(target)
{
	if(!target) return;
	let dist = parent.distance(target, character);
	let diff = {'x':(target.x-character.x),'y':(target.y-character.y)}
	let h = Math.atan2(diff.y, diff.x);

	if(dist > character.range)
	{
		move(
			character.x+(target.x-character.x)/10,
			character.y+(target.y-character.y)/10
		);
	}
	else if(dist < character.range)
	{
		let mv = character.range-dist-1;
		move(
			character.x-Math.cos(h)*mv,
			character.y-Math.sin(h)*mv
		);
	}
	if(can_attack(target))
	{

		quickskill("quickpunch", target)
		invis = invis || quickskill("invis")
		attack(target);
	}
}


