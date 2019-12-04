var nest_egg = 10000;

function merchant_mode()
{
	//some descison tree here at some point I guess;
}

var upgrade_to = 5;

async function upgrade_all_items()
{
	log("started")
	let a = get_upgrade_count();
	log("buying scrolls " +a.diff);
	
	while(a.diff > 0)
	{
		if(! await safe_buy("scroll0", a.diff)) return false;
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
	return true;
}

function get_upgrade_count()
{
	log("started count");
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

function gather_junk()
{
	char_list.filter(m => m !== character.id)
		.forEach(m => send_cm(m, {"unload" : true}));
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

/*for reference
async function async_test()
{
	log('x');
	var x = await buy(1).catch( (err) => log(err));
	log(x);
}
async function b(x)
{
	return new Promise( resolve => {
		setTimeout(() => { resolve(x);
				   }, 500);
	});
}
*/
