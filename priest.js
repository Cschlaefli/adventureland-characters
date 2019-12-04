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
start_alts();


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
	near_party.forEach( c => h = h && c.hp < c.max_hp * .8);
	if( h || near_party.filter( c => c.hp < 1000).length > 0) use("partyheal");
	
	if(!can_use("heal")) { hp_mp(.25,.25); return; }
		
	near_party.filter( c => c.hp < c.max_hp * .8)
		.sort( (a,b) => (a.hp/a.hp_max)-(b.hp/a.hp_max))
		.forEach( c => { heal(c); } );
	hp_mp(.0,.6);
}


setInterval(function(){
	update_party()
}, 1000*6)
