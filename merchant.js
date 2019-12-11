var nest_egg = 10000;

party_leader = true;

function merchant_mode()
{
	//some descison tree here at some point I guess;
}

var upgrade_to = 6;

async function compound_all_items()
{
	let comps = compound_count();
	while(comps.length > 0)
	{
		comps = compound_count()
		let curr = comps[0];
		let sc_name = "cscroll"+curr[0].grade;
		let scroll = locate_item(sc_name);
		while(scroll < 0)
		{
			let err = false;
			await buy(sc_name)
				.catch( e => {buy_err(e); err=true;});
			if(err == true) break;
			scroll = locate_item(sc_name);
		}
		await wait(1);
		if (character.q.compound) await wait( 1 + (character.q.compound.ms * .001))
		compound(curr[0].index,curr[1].index,curr[2].index,scroll);
		//await compound(curr[0].index,curr[1].index,curr[2].index,scroll).catch( e => log(e));
		log("compounded "+ curr[0].name);
		
	}
	return;
}

function upgrade_count()
{
	return  easy_inventory().filter( item => G.items[item.name].upgrade && (!item.level || item.level < upgrade_to));
}

async function upgrade_all_items()
{

	let to_up = upgrade_count();
	while(to_up.length > 0)
	{
		to_up = upgrade_count();
		let sc_name = "scroll"+to_up[0].grade;
		let scroll = locate_item(sc_name);
		while(scroll < 0)
		{
			let err = false;
			await buy(sc_name)
				.catch( e => {buy_err(e); err=true;});
			if(err == true) break;
			scroll = locate_item(sc_name);
		}
		await upgrade(to_up[0].index,scroll).catch( e => log(e));
		log("upgraded " + to_up[0].name);
	}
	
}

function compound_count()
{
	var inv = easy_inventory();
	let comp_map = {}
	inv.filter( e => G.items[e.name].compound)
		.forEach( e => {
			let k = e.name+e.level;
			if(!comp_map[k]) comp_map[k] = []; 
			comp_map[k].push(e);
		});
	var values = Object.keys(comp_map).map( k => comp_map[k]).filter( v=>v.length >=3);
	return values;
}

function buy_err(err)
{
	switch(reason.reason)
	{
		case "distance" :
			//travel
			return false;
		case "not_buyable" :
			log("check");
			return false;
		case "cost" :
			//fetch_gold
			return false;
		case "bank" :
			//deposit
			return false;
		default :
			return false;
	}
}

async function safe_buy(item, quantity)
{
	try{
		let res = await buy(item, quantity)
		return true;
	} catch(e) {
		log(reason);
		switch(reason.reason)
		{
			case "distance" :
				//travel
				return false;
			case "not_buyable" :
				log("check");
				return false;
			case "cost" :
				//fetch_gold
				return false;
			case "bank" :
				//deposit
				return false;
			default :
				return false;
		}
	}
}

function gather_junk()
{
        char_list.filter(m => m !== character.id)
                .forEach(m => send_cm(m, {"unload" : true}));
}
