var mode = 1
var hunting_ground = "";
var hunting = "arcticbee";

var party_leader = true
var targets = []

var invis = false
game.on("hit", function(data){
	if(data.target === character.id || char_list.includes(data.actor)) return;
	if(char_list.includes(data.target) ){
		change_target(get_monster(data.actor));
	}
});

function attack_mode()
{
	modes.default = modes.attack;
	var target=get_targeted_monster();
	//targets.filter( e => e).sort( (a,b) => a.hp - b.hp);
	
	hp_mp(0.5 , 0.1);
	
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
		
		target=get_nearest_monster({min_xp:100,max_att:400,type:hunting});
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
}

