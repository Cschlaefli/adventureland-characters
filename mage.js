var hunting_ground = "crabs"
var hunting = "crab"
var mode = 1;
var modes = {
        "idle" : 0,
        "attack" : 1,
        "buying" : 2,
        "moving" : 3,
        "support" : 4,
        "merchanting" : 5,
        "default" : 1
}


var party_leader = true;

var invis = false

var target_xp = 0
var target_time = new Date();
var hp_used = 0;
var mp_used = 0;

var hp_count = 0;
var mp_count = 0;


var support_also = false

function attack_mode()
{
	var target=get_targeted_monster();
	
	hp_mp(0.5 , 0.6);
	
	if( support_also) support_mode();

	if(!target)
	{
		
		update_pot_count();
		if (min(hp_count, mp_count) < min_pots)
		{
			mode = modes.buying;
			use("town", character);
			return
		}	
		
		target=get_nearest_monster({max_att:400,type:hunting});
		if(target && (!target.target || char_list.includes(target.target))){
			set_message("Targeted "+target.name);
			change_target(target);
			target_xp = target.xp
			target_time = new Date();
			hp_used = 0;
			mp_used = 0;
		}
		else
		{			
			set_message("No Monsters");
			mode = modes.moving;
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
		attack(target);
	}
}

function kite_attack(target)
{
	if(!target) return;
	if(!in_attack_range(target))
	{
		move(
			character.x+(target.x-character.x)/2,
			character.y+(target.y-character.y)/2
			);
	}
	else if(can_attack(target))
	{
		attack(target);
	}
}

setInterval(function(){
	update_party()
}, 1000*3)

function support_mode()
{
	update_pot_count();
	if (min(hp_count, mp_count) < min_pots)
	{
		mode = modes.buying;
		use("town", character);
		return
	}	
	hp_mp( .3, .6)
	let m = near_party.find(m => m.name === "GucciJesus")
	if(m)
	{
		let target = false
		if(m.target) target = get_monster(m.target);
		if(m.mp < m.max_mp * .25) quickskill("energize", m);
		kite_attack(target);
	}
	
}

