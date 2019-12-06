var nest_egg = 10000;

party_leader = true;

function merchant_mode()
{
	//some descison tree here at some point I guess;
}

var upgrade_to = 6;

async function try_compound(set)
{
	let grade = item_grade(curr[0]);
	let scroll = locate_item("cscroll"+grade);
	if(scroll < 0)
	{
		let buy_res = buy("cscroll"+grade).then( e => {
			return compound(curr[0].index,curr[1].index,curr[2].index,scroll);
		}).catch( e => {buy_err(e), reject();});
		scroll = locate_item("cscroll"+grade);
	}
}

async function compound_all_items()
{
	let comps = compound_count();
	while(comps.length > 0)
	{
		comps = compound_count()
		let curr = comps[0];
		let grade = item_grade(curr[0]);
		let scroll = locate_item("cscroll"+grade);
		while(scroll < 0)
		{
			let err = false;
			await buy("cscroll"+grade)
				.catch( e => {buy_err(e); err=true;});
			if(err == true) break;
			scroll = locate_item("cscroll"+grade);
		}
		await wait(1);
		if (character.q.compound) await wait( 1 + (character.q.compound.ms * .001))
		compound(curr[0].index,curr[1].index,curr[2].index,scroll);
		//await compound(curr[0].index,curr[1].index,curr[2].index,scroll).catch( e => log(e));
		log("compounded "+ curr[0]);
		
	}
	return;
}

async function upgrade_all_items()
{
	let a = upgrade_count();
	
	while(a.diff > 0)
	{
		await buy("scroll0", a.diff);
		a = get_upgrade_count();
	}
	//should have the scrolls here
	log(a.upgrade_indexs.length)

	for(x = 0; x < a.upgrade_indexs.length; x++)
	{
		let y = a.upgrade_indexs[x];
		let item = character.items[y];
		log("upgrading " + item.name);
		while(item && item.level < upgrade_to)
		{
			try {
				let result = await upgrade(y, a.scroll_index);
				if(!result.success) {
					log("failed");
					break;
				}
			}catch (e) {
				log(e.reason);
				break;
			}
			item = character.items[y];
		}
	}
	log("done");
	return true;
}

function upgrade_count()
{
	let a = { scrolls : 0,
        	scroll_index : -1,
        	upgrade_count : 0,
        	upgrade_indexs : []};

	character.items.forEach( (item, index) =>{
                if(item && item.name === "scroll0") { a.scrolls = item.q; a.scroll_index = index}
                else if (item && item.name && G.items[item.name].upgrade){
                        let diff = upgrade_to - item.level;
                        if ( diff > 0){
                                a.upgrade_count += diff;
                                a.upgrade_indexs.push(index);
                        }
                }
        });
	a["diff"] = a.upgrade_count - a.scrolls;
	return a;
}

function compound_count()
{
	var inv = easy_inventory();
	let comp_map = {}
	inv.filter( e => e && G.items[e.name].compound)
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

