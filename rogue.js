var mode = 1
var hunting_ground = "";
var hunting = "arcticbee";

var party_leader = true
var targets = []

var invis = false
let kills = 0
let wiffs = 0
let codestart = new Date();

game.on("hit", function(data){
	if(data.actor == "GucciJesus" && data.kill)
	{
		if(data.source == "mentalburst"){
			kills += 1;
		}
		else { 
			wiffs += 1;
		}
		let kps = (wiffs+kills)/(mssince(codestart)*.001)	
		log("Kills Per min : " + (kps*60).toFixed(2));
		log("Accuracy : " + (kills/(wiffs+kills)));

	}
	if(data.target === character.id || char_list.includes(data.actor) || data.actor === "Celery") return;
	if(char_list.includes(data.target) && data.source == "attack"){
		log(data.actor);
		//change_target(get_monster(data.actor));
	}
});

function attack_mode()
{
	if(!character.s.rspeed) use("rspeed", character);

	let active = get_active_characters();
	for( var x in active) { if(active[x] === "disconnected") start_alts(); }
	if( Object.keys(get_active_characters()).length < 3) start_alts();
	modes.default = modes.attack;
	var target=get_targeted_monster();
	if(target && character.targets == 0 && target.hp >= target.max_hp) target = null;
	//targets.filter( e => e).sort( (a,b) => a.hp - b.hp);
	
	hp_mp(0.6 , 0.5);
	if(target && target.target && !char_list.includes(target.target) ) target = null;
	
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
		
		target= get_nearest_monster({type:"snowman"});
		target= target || get_nearest_monster({min_xp:100,max_att:400,type:hunting});
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

let flip = 1;

setInterval(function() {flip*=-1;},2*1000); // Check every minute

function kite_attack(target)
{
	if(!target) return;
	let dist = parent.distance(target, character);
	let diff = {'x':(target.x-character.x),'y':(target.y-character.y)}
	let h = Math.atan2(diff.y, diff.x)// + Math.PI/2*flip;

	if(dist > character.range)
	{
		let mv = max(10, dist/6);
		move(
			character.x+Math.cos(h)*mv,
			character.y+Math.sin(h)*mv
			//character.x+(target.x-character.x)/5,
			//character.y+(target.y-character.y)/5
		);
	}
	else if(dist+5 < character.range)
	{
		let mv = character.range-dist+5;
		//if(Math.random() > .5) flip *= -1;
		let zig = Math.PI/4 * flip;
		move(
			character.x-Math.cos(h+zig)*mv,
			character.y-Math.sin(h+zig)*mv
		);
	}
	if(can_attack(target))
	{
		if(target.mtype == "snowman")
		{
			attack(target);
			return;
		}

		if(character.hp < 700 && target.dreturn) return;

		if(!character.s.invis)
		{
			quickskill("invis");

		}

		if(target.hp < 500)
		{
			if(target.hp < 300) quickskill("mentalburst");
			else quickskill("quickpunch", target);
			return;
		}

		if( mssince(last_use.attack) > 200)
		{
			attack(target).then(
				e =>last_use.attack = new Date()
			);
		}
		if(G.skills.quickpunch.mp < character.mp)
		{
			quickskill("quickpunch", target);
		}
		if(G.skills.mentalburst.mp < character.mp)
		{
			if(target.hp < 300) quickskill("mentalburst");
		}
	}
}


