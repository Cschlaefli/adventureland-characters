var hunting_ground = ""
var hunting = "croc"
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
	
	hp_mp(0.8 , 0.7);
	
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
		
		target=get_nearest_monster({max_att:400,type:hunting,no_target:true});
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
	
	
	kite_attack(target);
}

function kite_attack(target)
{
	if(!target) return;
	let dist = parent.distance(target, character);
	let diff = {'x':(target.x-character.x),'y':(target.y-character.y)}
	let mag = Math.sqrt(diff.x**2, diff.y**2);
	let normal = {'x':diff.x*(1/mag),'y':diff.y*(1/mag)}
	let h = Math.atan2(diff.y, diff.x);
	let mag_check = Math.sqrt(normal.x**2, normal.y**2);

	if(dist > character.range)
	{
		move(
			character.x+(target.x-character.x)/15,
			character.y+(target.y-character.y)/15
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
	/*else if(dist < target.range*3)
	{
		move(
			character.x-Math.cos(h)*10,
			character.y-Math.sin(h)*10
		);
	}*/
	if(can_attack(target))
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

