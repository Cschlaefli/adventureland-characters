load_code(7)
var mode = 4
let default_follow = 40
var modes = {
	"idle" : 0,
	"attack" : 1,
	"buying" : 2,
	"moving" : 3,
	"support" : 4,
	"default" : 4
}


function support_mode()
{
	update_pot_count();
	if (min(hp_count, mp_count) < min_pots)
	{
		mode = modes.buying;
		use("town", character);
		return;
	}
	//fix this to prioritize people better
	update_party();

	let h = true;
	if(near_party.length <= 1) h = false;
	near_party.forEach( c => h = h && c.hp < c.max_hp * .8);
	if( h || near_party.filter( c => c.hp < 1000).length > 0) use("partyheal");
	
	if(!can_use("heal")) { hp_mp(.25,.25); return; }
		
	near_party.filter( c => c.hp < c.max_hp * .8)
		.sort( (a,b) => (a.hp/a.hp_max)-(b.hp/a.hp_max))
		.forEach( c => { heal(c); } );
	hp_mp(.0,.6);
	let x = near_party.find( e => e.name === "Saleth" && e.target);
	if(!x)
	{
		return;
	}
	let mon = get_monster(x.target);
	if(mon)
	{
		if(!mon.s.cursed && mon.hp > 1000)
		{
			use("curse", mon);
		}
		if(new Date()>=parent.next_skill.attack)
		{
			attack(mon);
		}
	}
	else avoid_monsters();
/*
	let snowman = get_nearest_monster({type:"snowman"});
	if(can_attack(snowman)) attack(snowman);
	*/
}

function avoid_monsters()
{
	let m = get_nearest_monster();
	if(!m) return;
	let dist = parent.distance(m, character);
	let diff = {'x':(m.x-character.x),'y':(m.y-character.y)}
	
	let h = Math.atan2(diff.y, diff.x) + Math.PI/2;

	if(dist < 50)
	{ 
		let sp = 10;
		move( 
			character.x - Math.cos(h)*sp,
			character.y - Math.sin(h)*sp
		);
	}
}

setInterval(function(){
	update_party()
}, 1000*6)
