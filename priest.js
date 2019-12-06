load_code(7)
var mode = 4

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
	avoid_monsters();
	let x = near_party.find( e => e.name === "GucciJesus" && e.target);
	if(!x)
	{
		return;
	}
	let mon = get_monster(x.target);
	if(mon && mon.s && !mon.s.cursed)
	{
		if(mon.hp > 1000)
		{
			use("curse", mon);
		}
	}
}

function avoid_monsters()
{
	let m = get_nearest_monster();
	if(m && parent.distance(m, character) < 50)
	{ 
		let x = m.x - character.x;
		let y = m.y -character.y;
		move( 
			character.x - x,
			character.y - y
		);
	}
}

setInterval(function(){
	update_party()
}, 1000*6)
