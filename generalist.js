var mode = 0;
var hunting_ground = "bees"
var hunting = "bee"

var party_leader = false

var modes = {
	"idle" : 0,
	"attack" : 1,
	"buying" : 2,
	"moving" : 3,
	"support" : 4,
	"merchanting" : 5,
	"default" : 0
}

var cooldowns = {
	"invis" : G.skills.invis.cooldown
}
var last_use = {
	"invis" : new Date(),
	"quickpunch" : new Date(),
	"quickstab" : new Date()
}

var locations = {
	"slime" : {'x' : 0, 'y' : 800},
	"bees" : { 'x' : 520, 'y' : 1070 },
	"crocs" : { 'x' : 800, 'y' : 1600 },
	"sneks" : { 'x' : -116, 'y' : 1850},
	"crabs" : { 'x' : -1200, 'y' : 0},
	"bigcrabs" :{ 'x' : -1000, 'y' : 1670},
	"bees2" : {'x': 640, 'y': 720},
	"poisio" : {'x': -100, 'y' :900}
}

var char_list = ["Healtuls", "GucciJesus", "Saleth", "GucciGalore"]


var min_pots = 25;
var buy_to = 1000;

var invis = false

game.on("hit", function(data){
	if(data.actor === character.name){
		if (invis){
			last_use.invis = new Date();
			invis = false;
		}
		if (data.kill)
		{
			/*log("XP per second " + target_xp/(mssince(target_time)*.001));
			log("time spent" + mssince(target_time)*.001);
			log("hp used " + hp_used);
			log("mp used " + mp_used);
			log("cost " + (hp_used+mp_used)*20)
			*/
		}
	}
	if(data.target === character.name){
		//log(data)
	}
});


function follow(ch)
{
	if(!ch) return;
	follow_dist = 50;
	var x = ch.x - character.x;
	var y = ch.y - character.y;
	if (Math.sqrt((x*x)+ (y*y)) > follow_dist)
	{
		move(character.x+ (x/2), character.y + (y/2));
	}
}

function on_party_invite(name)
{
	if(char_list.includes(name)) accept_party_invite(name)
}

var target_xp = 0
var target_time = new Date();
var hp_used = 0;
var mp_used = 0;

var hp_count = 0;
var mp_count = 0;


function travel(location)
{
	let loc = locations[location]
	let dist = parent.distance(character, loc);
	if (dist > 100 )
	{
		smart_move(
			character.x+(loc.x-character.x)/2,
			character.y+(loc.y-character.y)/2
		);
	}
	else if (dist > 50)
	{
		move(
			character.x+(loc.x-character.x)/2,
			character.y+(loc.y-character.y)/2
		);
	}
	else
	{
		mode = modes.attack
	}
	
}

function buy_check(reason)
{
	if(is_transporting(character)) return;
	log(reason);
	switch(reason){
		case "distance" :
			use("town", character);
			break;
		case "cost" :
			mode = mode.default;
			break;
		default :
			mode = modes.default;
			break;
	}
}

var last_buy = new Date();

function buy_up()
{
	if( mssince(last_buy) < 1000) return;
	last_buy = new Date();
	update_pot_count();
	var _mp = buy_to - mp_count;
	var _hp = buy_to - hp_count;
	if( _mp <= 0 && _hp <= 0)
	{ 
		
		mode = modes.default;
		return;
	}
	if (_mp > 0) buy("mpot0", _mp).then(
		value => { last_buy = new Date();},
		reason => { buy_check(reason.reason)}
	);
	if (_hp > 0) buy("hpot0", _hp).then(
		value => { last_buy = new Date();},
		reason => { buy_check(reason.reason)}
	);
}

function update_pot_count()
{
	hp_count = 0;
	mp_count = 0;
	character.items
		.filter( i => i && i.name.includes("pot"))
		.forEach(function(item) {
		if (!item) return;
		if (item.name == "hpot0") hp_count = item.q;
		if (item.name == "mpot0") mp_count = item.q;
	});
}

function quickskill(name, target)
{
	if(can_use(name))
	{
		use(name, target);
		return true;
	}
	return false;
}


function hp_mp(hp_cap, mp_cap){
	if(safeties && mssince(last_potion)<min(200,character.ping*3)) return;
	var used=false;
	if(new Date()<parent.next_skill.use_hp) return;
	if(character.mp/character.max_mp<mp_cap) use('use_mp'),used=true,mp_used+=1;
	else if(character.hp/character.max_hp<hp_cap) use('use_hp'),used=true,hp_used+=1;
	if(used) last_potion=new Date();
}

setInterval(function(){

	//use_hp_or_mp();
	loot();
	
	if( character.rip || is_moving(character)) return;
	
	if (!party_leader){
		if (mode != modes.buying)
		{
			follow(party.find(m => m.name === "GucciJesus"))
		}
		else
		{
			update_party();
		}
	}

	
	switch(mode)
	{
		case modes.idle :
			set_message("manual");
			return;
		case modes.attack :
			attack_mode();
			break;
		case modes.buying :
			set_message("buying");
			if (!is_transporting(character)) buy_up();
			break;
		case modes.moving :
			travel(hunting_ground);
			break;
		case modes.support :
			set_message("supporting");
			support_mode();
			break;
		case modes.merchanting :
			set_message("merching");
			merchant_mode();
		default :
			mode = modes.default;
			return;
	}	
},1000/10); // Loops every 1/4 seconds.

var last_xp = character.xp
const xp_interval = 60

setInterval( ()=> {
	if(character.ctype === "merchant") return;
	let avg_xp = (character.xp- last_xp)/xp_interval
	log("xp per sec " + avg_xp)
	let ttl = (character.max_xp - character.xp)/avg_xp
	log("Time to next level " + (ttl/(60)).toFixed(0) + " mins or " + (ttl/(60*60)).toFixed(2) + " hrs" )
	last_xp = character.xp;
}, 1000 * xp_interval);

var last_cm = new Date();

function on_cm(name,data)
{
	if( !char_list.includes(name))
	{ 
		log(name + "sent you " + data);
		return;
	}
	data["name"] = name
	if (data.use){
		if (data.target) use(data.use, data.target);
		else use(data.use);
	}
	else if (data.location_request) send_cm(name, {'x' : character.x, 'y' : character.y});
	else if (data.x && data.y) party.push(data);
	else if (data.mode) mode = modes[data.mode];
	if (data.unload) character.items.forEach( (e, index) => { if ( e && !e.name.includes("pot")) send_item(name,index,e.q);});
	if (data.gold) send_gold(name, data.gold);
}	


var party = []
var near_party = []
function update_party()
{
	if ( mssince(last_cm) < 6 * 1000) return;
	party = []
	near_party = []
	parent.party_list.forEach(function(member){
	if (member != character.name)
		{
			var m = get_player(member)
			if(m) { party.push(m); near_party.push(m);}
			else{ 
				send_cm(member, {"location_request" : true})
				last_cm = new Date();
				log("requesting " + member)
			}
		}
	});
	near_party.push(character);
}


async function request_port()
{
	send_cm("Saleth", {"use":"magiport", "target":character.id})
	await wait(2);
	accept_magiport("Saleth");
}	

function visible_monsters()
{
	let mons = []
	for(id in parent.entities)
	{
		var current=parent.entities[id];
		if(current.type!="monster" || !current.visible || current.dead) continue;
		mons.push(current)
	}
	return mons;
}

function set_mode(mode)
{
	parent.party_list.forEach( m => send_cm(m, {"mode" :mode}) );
}

map_key("G","snippet", "pause();")

function start_alts()
{
	start_character("GucciJesus", 2);
	start_character("Saleth", 5);
	wait(5).then( e => char_list.forEach(e => send_party_invite(e)));
}

async function wait(x)
{
	return new Promise( resolve => {
		setTimeout(() => { resolve(true);
				   }, x*1000);
	});
}

function easy_inventory()
{
	return character.items.map( (item, index) => {
			let out = {};
			if(!item) return;
			if(item.name) out.name = item.name;
			if(item.level) out.level = item.level;
			if(item.q) out.q = item.q;
			out.index = index;
			return out;
		});
}

function equip_up()
{
	for(var x in character.slots)
	{
		let check = character.slots[x];
		if(!check) continue;
		let match = easy_inventory().filter( e => e && check.name === e.name && (check.level ? check.level : 0) < e.level)
			.sort((a,b) => b.level - a.level)
			.find(e=>true);
		if(match) equip(match.index,x);
	}
}

