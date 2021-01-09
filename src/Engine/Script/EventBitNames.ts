import { hex } from "@/src/Engine/utils";

const mapBits: Record<number, string> = {
  "1": "Terra Intro Event",
  "3": "Locke Intro Event",
  "4": "Edgar Intro Event",
  "5": "Sabin Intro Event",
  "6": "Figaro Castle / Kefka Event",
  "7": "Figaro Castle / Sabin Event",
  "8": "Figaro Castle / Following Locke",
  "10": "South Figaro / Shadow walking to pub",
  "11": "Shadow Intro Event",
  "13": "Mt. Kolts / Vargas Shadow 1",
  "14": "Mt. Kolts / Vargas Shadow 2",
  "15": "Mt. Kolts / Vargas Shadow 3",
  "16": "Mt. Kolts / Vargas Event",
  "17": "Returner's Hideout / Met Banon",
  "20": "Returner's Hideout / Declined Once",
  "21": "Returner's Hideout / Declined Twice",
  "22": "Returner's Hideout / Declined Three Times",
  "23": "Returner's Hideout / Wounded Returner Event",
  "24": "Returner's Hideout / Banon joined",
  "25": "Lete River / First Battle",
  "26": "Lete River / Ultros Battle",
  "27": "South Figaro / Celes Intro",
  "28": "South Figaro / Celes Named",
  "29": "South Figaro / Celes Rescued",
  "30": "Cave to South Figaro / TunnelArmr Battle",
  "31": "Narshe / Banon & Guard",
  "32": "Narshe / Secret Entrance",
  "33": "Narshe / Banon & Elder",
  "34": "Crazy Old Man's House / Stove",
  "36": "Shadow's First Dream",
  "38": "Shadow's Second Dream",
  "39": "Shadow's Third Dream",
  "40": "Shadow's Fourth Dream",
  "41": "Kefka's Tower / Intro Event",
  "42": "Floating Island / Met Shadow",
  "43": "Imperial Camp / Second Leo Event",
  "44": "Imperial Camp / Kefka 1",
  "45": "Imperial Camp / Kefka 2",
  "46": "Imperial Camp / Kefka 3",
  "47": "Imperial Camp / Kefka 4",
  "48": "Doma Castle / Cyan Intro",
  "49": "Doma Castle / King Doma",
  "50": "Doma Castle / Cyan's Family",
  "51": "Imperial Camp / Cyan 1",
  "52": "Imperial Camp / Cyan 2",
  "53": "Imperial Camp / Cyan 3",
  "54": "Imperial Camp / Cyan 4",
  "55": "Imperial Camp / After Escape",
  "56": "Phantom Train / Intro Event",
  "57": "Phantom Train / Train Departed",
  "58": "Phantom Forest / Train Gone",
  "59": "Phantom Train / GhostTrain Battle",
  "60": "Baren Falls / Intro Event",
  "63": "Gau Intro Event",
  "65": "Crescent Mountain / Diving Helmet Event",
  "67": "Nikeah / Cyan & Hooker Event",
  "68": "Nikeah / Sabin & Cyan Travel to Narshe",
  "69": "Narshe / After 3 Scenarios",
  "70": "Narshe / After Snowfield Battle",
  "71": "Narshe / Following Terra",
  "72": "Figaro Castle / Sabin is wandering around",
  "73": "Figaro Castle / Edgar & Sabin Event",
  "74": "South Figaro / Sabin & Duncan's Wife Event",
  "75": "Kohlingen / Rachel Flashback Event",
  "76": "Kohlingen / Rachel & Crazy Man Event",
  "83": "Zozo / Ramuh Intro Event",
  "84": "Zozo / After Ramuh",
  "94": "Reached Southern Continent",
  "95": "Magitek Factory / Kefka & Espers Event",
  "96": "Magitek Factory / Ifrit & Shiva Event",
  "104": "Magitek Research Facility / Kefka & Celes Event",
  "105": "Magitek Research Facility / Start of Train Ride",
  "106": "Magitek Research Facility / End of Train Ride",
  "107": "Magitek Research Facility / Crane Battle",
  "108": "Esper World / Intro Event",
  "109": "Esper World / Maduin & Madonna Event",
  "110": "Esper World / Terra is Born",
  "112": "Esper World / End of Flashback",
  "121": "Cave to the Sealed Gate / After Gate Event",
  "122": "Cave to the Sealed Gate / Airship Crashed",
  "123": "Vector / After Esper Attack",
  "124": "Vector / Before Banquet",
  "125": "Vector / After Banquet",
  "126": "Umaro Intro Event",
  "127": "Kefka's Tower / Rock Slide",
  "128": "Kefka's Tower / Gate",
  "129": "Blackjack / Cid & Setzer",
  "131": "Albrook / Boarded Ship",
  "133": "Albrook / Met Leo",
  "134": "Albrook / Terra & Leo at Night",
  "135": "Albrook / Locke & Celes at Night",
  "137": "Albrook / Reached Island",
  "139": "Thamasa / Fire Kid",
  "140": "Thamasa / Cure Kid",
  "141": "Thamasa / Named Strago and Relm",
  "142": "Thamasa / Woken up at Inn",
  "143": "Thamasa / Burning Building Intro",
  "144": "Thamasa / FlameEater",
  "145": "Thamasa / Heading to Esper Mountain",
  "146": "Thamasa / Shadow Left",
  "149": "Esper Mountain / Ultros",
  "151": "Esper Mountain / Statues",
  "152": "World of Balance / Esper Mountain Visible",
  "153": "Esper Mountain / Met Espers",
  "154": "Albrook / Play Shadow's Music",
  "155": "Thamasa / Fought Kefka",
  "156": "Thamasa / Leo's Grave",
  "157": "Thamasa / Events Completed",
  "158": "Floating Island is Accessible",
  "159": "Floating Island is not Accessible",
  "160": "Floating Island / IAF",
  "163": "Floating Island / Left Shadow Behind",
  "164": "World of Ruin",
  "166": "Hide Party on Map 10",
  "167": "Met Crimson Robber 1",
  "168": "Met Crimson Robber 2",
  "169": "Met Crimson Robber 3",
  "170": "Met Crimson Robber 4",
  "171": "Crimson Robber Left Cafe",
  "172": "On Crimson Robber Ship",
  "173": "Cave to South Figaro / Music ???",
  "174": "Cave to South Figaro / Noise 1",
  "175": "Cave to South Figaro / Noise 2",
  "176": "Cave to South Figaro / Noise 3",
  "177": "Cave to South Figaro / Recovery Spring",
  "178": "Solitary Island / Examined Dead Cid",
  "179": "Solitary Island / Cid Recovered",
  "180": "Solitary Island / Cid Died",
  "182": "Narshe / Got Ragnarok",
  "184": "Narshe / Got Cursed Shield",
  "186": "Fanatics' Tower / Got Strago",
  "188": "Kefka's Tower / Guardian",
  "189": "Kefka's Tower / Inferno",
  "190": "Mobliz / Terra & Katarin Missing",
  "191": "Mobliz / Got Terra",
  "194": "Darill's Tomb / DLRO",
  "195": "Darill's Tomb / ERAU",
  "196": "Darill's Tomb / QSSI",
  "197": "Darill's Tomb / WEHT",
  "198": "Figaro Castle / Got Edgar (WoR)",
  "199": "Figaro Castle / Tentacles",
  "200": "Ancient Castle / Got Odin",
  "202": "Kohlingen / Got Setzer",
  "203": "Darill's Tomb / Opened Entrance",
  "204": "Darill's Tomb / Flashback Scene",
  "205": "Darill's Tomb / Got Falcon",
  "208": "Kefka's Tower / Two Doorways",
  "210": "Mt. Zozo / Got Cyan",
  "212": "Gogo's Cave / Got Gogo",
  "215": "Phoenix Cave / Got Locke",
  "217": "Owzer's House / Got Starlet",
  "218": "Doma Castle / Cyan's Dream",
  "220": "World of Ruin / Figaro Castle -> Kohlingen",
  "222": "Figaro Castle / On Fire",
  "256": "Sabin's House / Edgar Dialog",
  "257": "South Figaro / Merchant -> Old Man's House",
  "258": "South Figaro / Merchant -> Pub",
  "259": "South Figaro / Locke is a Green Soldier",
  "260": "South Figaro / Locke is a Merchant",
  "261": "South Figaro / Is Occupied",
  "262": "World of Ruin / Figaro Castle -> East",
  "263": "South Figaro / Delivered Cider",
  "264": "Cave to South Figaro / Guard will Leave",
  "266": "Mt. Kolts / Vargas Hops Down",
  "267": "World of Balance / Figaro Castle -> East",
  "268": "World of Balance / Figaro Castle -> Kohlingen",
  "269": "South Figaro / Wound the Clock",
  "270": "Named Setzer",
  "272": "Opera House / Ultros Intro",
  "273": "Opera House / Performed Correctly",
  "274": "Darill's Tomb / Solved Tomb Puzzle",
  "275": "Opera House / Failed Once",
  "276": "Opera House / Failed Twice",
  "277": "Opera House / Failed Three Times",
  "278": "Esperville / Event 1",
  "279": "Esperville / Event 2",
  "280": "Esperville / Event 3",
  "281": "Opera House / Shadow Left",
  "291": "Cave to South Figaro / Can Jump on Turtle",
  "292": "Number of Characters in Party 1",
  "293": "Number of Characters in Party 2",
  "294": "Number of Characters in Party 3",
  "295": "Disable Warp",
  "296": "Narshe / First Guards",
  "297": "Narshe / Second Guards",
  "298": "Narshe / Third Guards",
  "299": "Narshe / Entered Cave",
  "300": "Narshe / Whelk Gate",
  "304": "Narshe / Fourth Guards",
  "305": "Narshe / Fifth Guards",
  "309": "Narshe / Whelk",
  "318": "Narshe / Green Soldier 1",
  "319": "Narshe / Green Soldier 2",
  "320": "Narshe / Green Soldier 3",
  "321": "Narshe / Green Soldier 4",
  "322": "Narshe / Green Soldier 5",
  "323": "Narshe / Green Soldier 6",
  "324": "Narshe / Brown Soldier 1",
  "325": "Narshe / Brown Soldier 2",
  "326": "Narshe / Brown Soldier 3",
  "327": "Narshe / Brown Soldier 5",
  "328": "Narshe / Brown Soldier 6",
  "364": "Jidoor / Bought ZoneSeek",
  "365": "Jidoor / Bought Golem",
  "366": "Cave in the Veldt / Switch",
  "367": "Learned Airship Controls",
  "416": "<characterNames[0]>",
  "417": "<characterNames[1]>",
  "418": "<characterNames[2]>",
  "419": "<characterNames[3]>",
  "420": "<characterNames[4]>",
  "421": "<characterNames[5]>",
  "422": "<characterNames[6]>",
  "423": "<characterNames[7]>",
  "424": "<characterNames[8]>",
  "425": "<characterNames[9]>",
  "426": "<characterNames[10]>",
  "427": "<characterNames[11]>",
  "428": "<characterNames[12]>",
  "429": "<characterNames[13]>",
  "430": "Character 14",
  "431": "Character 15",
  "432": "Party is facing up",
  "433": "Party is facing right",
  "434": "Party is facing down",
  "435": "Party is facing left",
  "436": "A button is pressed",
  "439": "Serpent Trench arrow is pointing left",
  "440": "Alternate World Map Music",
  "441": "Airship is Visible",
  "442": "Airship is Anchored",
  "443": "Party is on the veldt",
  "446": "Not enough GP",
  "447": "Party is on a save point",
  "449": "Disable sprint shoes",
  "450": "Disable main menu",
  "454": "Enable character portrait",
  "459": "Thamasa / Play Relm's Song",
  "460": "Song Override",
  "461": "Disable Random Battles",
  "462": "Enable Party Switching",
  "463": "Map Event is Running",
  "464": "<stringTable.rareItemName[0]>",
  "465": "<stringTable.rareItemName[1]>",
  "466": "<stringTable.rareItemName[2]>",
  "467": "<stringTable.rareItemName[3]>",
  "468": "<stringTable.rareItemName[4]>",
  "469": "<stringTable.rareItemName[5]>",
  "470": "<stringTable.rareItemName[6]>",
  "471": "<stringTable.rareItemName[7]>",
  "472": "<stringTable.rareItemName[8]>",
  "473": "<stringTable.rareItemName[9]>",
  "474": "<stringTable.rareItemName[10]>",
  "475": "<stringTable.rareItemName[11]>",
  "476": "<stringTable.rareItemName[12]>",
  "477": "<stringTable.rareItemName[13]>",
  "478": "<stringTable.rareItemName[14]>",
  "479": "<stringTable.rareItemName[15]>",
  "480": "<stringTable.rareItemName[16]>",
  "481": "<stringTable.rareItemName[17]>",
  "482": "<stringTable.rareItemName[18]>",
  "483": "<stringTable.rareItemName[19]>",
  "484": "Unused Rare Item 21",
  "485": "Unused Rare Item 22",
  "486": "Unused Rare Item 23",
  "487": "Unused Rare Item 24",
  "488": "Unused Rare Item 25",
  "489": "Unused Rare Item 26",
  "490": "Unused Rare Item 27",
  "491": "Unused Rare Item 28",
  "494": "Selected a Valid Colosseum Item",
  "495": "Fighting Shadow in the Colosseum",
  "496": "Local Control 1",
  "497": "Local Control 2",
  "498": "Local Control 3",
  "499": "Local Control 4",
  "500": "Local Control 5",
  "501": "Local Control 6",
  "502": "Local Control 7",
  "503": "Local Control 8",
  "504": "Local Control 9",
  "505": "Local Control 10",
  "506": "Local Control 11",
  "507": "Local Control 12",
  "508": "Local Control 13",
  "509": "Local Control 14",
  "510": "Local Control 15",
  "511": "Local Control 16",
  "512": "Imperial Castle / Talked to 2 soldiers",
  "513": "Imperial Castle / Talked to 3 soldiers",
  "514": "Imperial Castle / Talked to 4 soldiers",
  "515": "Imperial Castle / Talked to 5 soldiers",
  "516": "Imperial Castle / Talked to 6 soldiers",
  "517": "Imperial Castle / Talked to 7 soldiers",
  "518": "Imperial Castle / Talked to 8 soldiers",
  "519": "Imperial Castle / Talked to 9 soldiers",
  "520": "Imperial Castle / Talked to 10 soldiers",
  "521": "Imperial Castle / Talked to 11 soldiers",
  "522": "Imperial Castle / Talked to 12 soldiers",
  "523": "Imperial Castle / Talked to 13 soldiers",
  "524": "Imperial Castle / Talked to 14 soldiers",
  "525": "Imperial Castle / Talked to 15 soldiers",
  "526": "Imperial Castle / Talked to 16 soldiers",
  "527": "Imperial Castle / Talked to 17 soldiers",
  "528": "Imperial Castle / Talked to 18 soldiers",
  "529": "Imperial Castle / Talked to 19 soldiers",
  "530": "Imperial Castle / Talked to 20 soldiers",
  "531": "Imperial Castle / Talked to 21 soldiers",
  "532": "Imperial Castle / Talked to 22 soldiers",
  "533": "Imperial Castle / Talked to 23 soldiers",
  "534": "Imperial Castle / Talked to 24 soldiers",
  "535": "Imperial Castle / Talked to soldier 1",
  "536": "Imperial Castle / Talked to soldier 2",
  "537": "Imperial Castle / Talked to soldier 3",
  "538": "Imperial Castle / Talked to soldier 4",
  "539": "Imperial Castle / Talked to soldier 5",
  "540": "Imperial Castle / Talked to soldier 6",
  "541": "Imperial Castle / Talked to soldier 7",
  "542": "Imperial Castle / Talked to soldier 8",
  "543": "Imperial Castle / Talked to soldier 9",
  "544": "Imperial Castle / Talked to soldier 10",
  "545": "Imperial Castle / Talked to soldier 11",
  "546": "Imperial Castle / Talked to soldier 12",
  "547": "Imperial Castle / Talked to soldier 13",
  "548": "Imperial Castle / Talked to soldier 14",
  "549": "Imperial Castle / Talked to soldier 15",
  "550": "Imperial Castle / Talked to soldier 16",
  "551": "Imperial Castle / Talked to soldier 17",
  "552": "Imperial Castle / Talked to soldier 18",
  "553": "Imperial Castle / Talked to soldier 19",
  "554": "Imperial Castle / Talked to soldier 20",
  "555": "Imperial Castle / Talked to soldier 21",
  "556": "Imperial Castle / Talked to soldier 22",
  "557": "Imperial Castle / Talked to soldier 23",
  "558": "Imperial Castle / Talked to soldier 24",
  "665": "Mt. Kolts / Storm Dragon is Flying Around",
  "666": "Mt. Kolts / Storm Dragon was Defeated",
  "683": "Retain Timers 1",
  "684": "Retain Timers 2",
  "685": "Retain Timers 3",
  "686": "Retain Timers 4",
  "700": "Continue Music During Battle",
  "704": "Enable Fade Bars (ending)",
  "708": "Party 1 switch A",
  "709": "Party 1 switch B",
  "710": "Party 1 switch C",
  "711": "Party 1 switch D",
  "712": "Party 2 switch A",
  "713": "Party 2 switch B",
  "714": "Party 2 switch C",
  "715": "Party 2 switch D",
  "716": "Party 3 switch A",
  "717": "Party 3 switch B",
  "718": "Party 3 switch C",
  "719": "Party 3 switch D",
  "720": "Phoenix Cave / Water is drained",
  "721": "Phoenix Cave / Spikes have been lowered 3",
  "722": "Phoenix Cave / Stones rearranged (party 1)",
  "723": "Phoenix Cave / Stones rearranged (party 2)",
  "724": "Phoenix Cave / Stepping stones (party 1)",
  "725": "Phoenix Cave / Stepping stones (party 2)",
  "726": "Phoenix Cave / Lowered platform",
  "727": "Umaro's Cave / Obtained Fenrir",
  "728": "Narshe / Security Checkpoint Intro",
  "729": "Kohlingen / Disable music in Rachel's house",
  "730": "Fanatics' Tower / Top room treasure chest",
  "731": "Fanatics' Tower / Defeated MagiMaster",
  "732": "Fanatics' Tower / Pressed switch",
  "733": "Ancient Castle / Obtained Raiden",
  "734": "Ancient Castle / Pressed switch",
  "735": "Ancient Castle / Flashback scene",
  "736": "Terra is initialized",
  "737": "Locke is initialized",
  "738": "Cyan is initialized",
  "739": "Shadow is initialized",
  "740": "Edgar is initialized",
  "741": "Sabin is initialized",
  "742": "Celes is initialized",
  "743": "Strago is initialized",
  "744": "Relm is initialized",
  "745": "Setzer is initialized",
  "746": "Mog is initialized",
  "747": "Gau is initialized",
  "748": "Gogo is initialized",
  "749": "Umaro is initialized",
  "750": "Character 15 is initialized",
  "751": "Character 16 is initialized",
  "752": "Terra is available",
  "753": "Locke is available",
  "754": "Cyan is available",
  "755": "Shadow is available",
  "756": "Edgar is available",
  "757": "Sabin is available",
  "758": "Celes is available",
  "759": "Strago is available",
  "760": "Relm is available",
  "761": "Setzer is available",
  "762": "Mog is available",
  "763": "Gau is available",
  "764": "Gogo is available",
  "765": "Umaro is available",
  "766": "Go to Narshe scene after Magitek March",
  "767": "At least one saved game",
};

const npcBits: Record<number, string> = {
  "0": "Always Visible",
  "2": "Figaro Castle: Guards Blocking Stairs",
  "3": "South Figaro: NPC's (Not Occupied)",
  "4": "South Figaro: NPC's",
  "5": "South Figaro: Shadow (Cafe)",
  "6": "Sabin's House: Old Man",
  "7": "South Figaro: Merchant (Cafe)",
  "8": "FIgaro Castle: Edgar (Throne Room)",
  "9": "Figaro Castle: NPC's (Throne Room)",
  "10": "South Figaro: Merchant (Old Man's House)",
  "11": "Figaro Castle: NPC's (Exterior)",
  "12": "South Figaro: NPC's (When Occupied)",
  "13": "Figaro Castle: Guards Blocking Doors",
  "14": "Figaro Castle: Guards Next to Doors",
  "15": "Figaro Castle: NPC's (Interior)",
  "16": "Figaro Castle: NPC's (Interior)",
  "17": "Figaro Castle: Locke (Exterior)",
  "18": "Cave to South Figaro: Guards (Outside)",
  "19": "Figaro Castle: Locke (East Tower)",
  "20": "Zozo: Esper Terra",
  "21": "Figaro Castle: Top Guard",
  "22": "Figaro Castle: Chancellor (Interior)",
  "23": "South Figaro: Celes in Chains",
  "24": "South Figaro: Upper Green Soldier",
  "25": "South Figaro: Lower Green Soldier",
  "27": "South Figaro: Brown Soldier Who Takes a Break",
  "28": "Mt. Kolts: Vargas",
  "29": "Cave to South Figaro/Mt. Kolts: Soldiers",
  "30": "Zozo: Ramuh",
  "31": "Zozo: Ramuh Magicite",
  "32": "Zozo: Siren Magicite",
  "33": "Zozo: Kirin Magicite",
  "34": "Zozo: Stray Magicite",
  "41": "3 Scenarios / Locke",
  "42": "3 Scenarios / Sabin",
  "43": "3 Scenarios / Banon",
  "44": "3 Scenarios / Terra",
  "45": "3 Scenarios / Edgar",
  "46": "Mt. Kolts: Shadow Sabin (Upper Exterior)",
  "47": "Jidoor: Impresario (Owzer's House)",
  "49": "Jidoor: Letter (Owzer's House)",
  "50": "Opera House: Impresario (Lobby)",
  "55": "Esper World: Yura",
  "56": "Esper World: Madonna (Exterior)",
  "57": "Esper World: Madonna (In Bed)",
  "58": "Esper World: Fairy (Interior)",
  "59": "Esper World: Elder (Interior)",
  "60": "Esper World: NPC's (Interior)",
  "61": "Esper World: NPC's (Exterior)",
  "62": "Esper World: Elder (Exterior)",
  "64": "Opera House: Impresario Blocking Entrance (Lobby)",
  "65": "Opera House: Man Blocking Entrance (Lobby)",
  "66": "Opera House: Ultros (Lobby)",
  "67": "Opera House: Draco A (Intro)",
  "68": "Opera House: Draco B (Intro)",
  "69": "Opera House: Letter (Backstage)",
  "70": "Opera House: Lower Dancing Couple",
  "71": "Opera House: Draco/Fighting Soldiers",
  "72": "Opera House: Upper Dancing Couples",
  "73": "Opera House: Actors (Catwalk)",
  "74": "Zozo: Dadaluma",
  "75": "Opera House: Ultros (Catwalk)",
  "76": "Opera House: Rat A",
  "77": "Opera House: Rat B",
  "78": "Opera House: Rat C",
  "79": "Opera House: Rat D",
  "80": "Opera House: Rat E",
  "85": "Opera House: Blocked Door to Catwalk",
  "86": "Zozo: Rusted Door",
  "87": "Esper World: Madonna (Cave)",
  "88": "South Figaro: Sprint Shoes Guy",
  "89": "Figaro Castle: Lone Wolf (Prison)",
  "90": "Esper World: Baby Terra (Interior)",
  "91": "Esper World: Madonna (Interior)",
  "92": "Esper World: Elder (Sealing Gate)",
  "93": "Esper World: Gestahl/Soldiers (Cave)",
  "94": "Floating Island: Shadow",
  "95": "Floating Island: Atma Weapon",
  "96": "South Figaro: Magitek Armor",
  "97": "Floating Island: Nerapa",
  "102": "Opera House: Letter (Lobby)",
  "103": "Solitary Island: Cid in Bed",
  "104": "Solitary Island: Blocking Stairs",
  "105": "Solitary Island: A yummy fish",
  "106": "Solitary Island: Just a fish",
  "107": "Solitary Island: A rotten fish",
  "108": "Solitary Island: Fish",
  "109": "Solitary Island: Raft in Basement",
  "110": "Solitary Island: Cid Walking Around",
  "112": "Solitary Island: Bird (Cliff)",
  "113": "Solitary Island: Bird (Beach)",
  "114": "Solitary Island: Letter",
  "115": "Nikeah: Old Woman (Cafe)",
  "116": "Nikeah: Thieves (Cafe)",
  "117": "Nikeah: Thieves (Exterior)",
  "118": "Nikeah: Gerad (Exterior)",
  "119": "Nikeah: Thieves (Docks)",
  "120": "Nikeah: Gerad (Docks)",
  "121": "South Figaro: Other NPC's ???",
  "122": "South Figaro: Thieves (WoR)",
  "123": "South Figaro: Male Lover (WoR)",
  "124": "South Figaro: Female Lover (WoR)",
  "125": "Blackjack: Shadow ???",
  "126": "South Figaro: Gerad (Inn)",
  "127": "Cave to South Figaro: Gerad/Thieves",
  "128": "Figaro Castle: Prisoners",
  "129": "Figaro Castle: Guard (Prison)",
  "130": "Figaro Castle: Dead Guards",
  "131": "Figaro Castle: Gerad (Prison)",
  "132": "Zozo: Bird",
  "133": "Zozo: Ghost",
  "134": "Opera House: Man (Lobby)",
  "135": "Opera House: Dirt Dragon",
  "136": "Falcon: Terra",
  "137": "Falcon: Locke",
  "138": "Falcon: Shadow",
  "139": "Falcon: Cyan",
  "140": "Falcon: Edgar",
  "141": "Falcon: Sabin",
  "142": "Falcon: Celes",
  "143": "Falcon: Strago",
  "144": "Falcon: Relm",
  "145": "Falcon: Setzer",
  "146": "Falcon: Mog",
  "147": "Falcon: Gau",
  "148": "Falcon: Gogo",
  "149": "Falcon: Umaro",
  "150": "Darill's Tomb: Blocked Door Underwater",
  "151": "Figaro Castle: Locked Doors While Submerged",
  "152": "Cave to South Figaro: Siegfried (Tunnel)",
  "153": "Cave to South Figaro: Siegfried (South Entrance)",
  "154": "Kefka's Tower: Kefka",
  "155": "Solitary Island: Palidor Magicite",
  "157": "Kohlingen: Plant",
  "158": "Kefka's Tower: Sparkles (Top)",
  "159": "Falcon: NPC's (Cutscenes)",
  "160": "Character Portrait",
  "240": "Figaro Castle: Tentacles (Engine Room)",
  "241": "Figaro Castle: Gerad (Engine Room)",
  "242": "Figaro Castle: Thieves (Engine Room)",
  "243": "Falcon: Darill",
  "244": "Opera House: Draco/Maria (Fight Scene)",
  "254": "Local Control 2",
  "255": "Local Control 1",
  "259": "Imperial Camp: Leo",
  "260": "Imperial Camp: Kefka (Tent)",
  "261": "Imperial Camp: Kefka (Poison)",
  "275": "Returner's Hideout: First Soldier",
  "278": "Returner's Hideout: Sabin",
  "279": "Returner's Hideout: Banon (Main Room)",
  "284": "Returner's Hideout: Wounded Soldier",
  "285": "Returner's Hideout: Banon (Back Room)",
  "286": "Returner's Hideout: Treasure Room Soldier",
  "287": "Returner's Hideout: Edgar",
  "288": "Returner's Hideout: Locke",
  "289": "Returner's Hideout: Banon (Entrance)",
  "290": "Lete River: Ultros",
  "293": "Crazy Old Man's House: Crazy Old Man",
  "294": "Crazy Old Man's House: Shadow",
  "295": "Crazy Old Man's House: Interceptor",
  "296": "Lete River: Raft (Exterior)",
  "297": "Imperial Camp: Magitek Armor A",
  "298": "Imperial Camp: Magitek Armor B",
  "299": "Imperial Camp: Cyan",
  "308": "Crazy Old Man's House: Merchant",
  "315": "Returner's Hideout: Inn Soldier",
  "342": "Blackjack: Setzer (Interior)",
  "343": "Blackjack: Coin",
  "344": "Blackjack: Setzer (Celes' Room)",
  "345": "Blackjack: Setzer (Exterior)",
  "346": "Blackjack: Refreshments Guy",
  "347": "Blackjack: Shop Guy",
  "348": "Blackjack: Book",
  "349": "Imperial Base: Locked Treasure Room",
  "350": "Imperial Base: Soldier A",
  "351": "Imperial Base: Soldier B",
  "352": "Imperial Base: Soldier C",
  "353": "Imperial Base: Soldier D",
  "354": "Imperial Base: Soldier E",
  "355": "Imperial Base: Soldier F",
  "356": "Imperial Base: Soldier G",
  "357": "Imperial Base: Soldier H",
  "358": "Imperial Base: Soldier I",
  "360": "Cave to the Sealed Gate: Gate",
  "366": "Cave to the Sealed Gate: Kefka",
  "367": "Cave to the Sealed Gate: Soldier A",
  "368": "Cave to the Sealed Gate: Soldier B",
  "369": "Cave to the Sealed Gate: Return to Airship",
  "370": "Blackjack: Cid",
  "371": "Blackjack: Man in Casino",
  "372": "Thamasa: Baram",
  "373": "Thamasa: Clyde",
  "375": "Blackjack: Terra",
  "376": "Blackjack: Locke",
  "377": "Blackjack: Cyan",
  "378": "Blackjack: Shadow",
  "379": "Blackjack: Edgar",
  "380": "Blackjack: Sabin",
  "381": "Blackjack: Celes",
  "382": "Blackjack: Strago",
  "383": "Blackjack: Relm",
  "384": "Blackjack: Setzer",
  "385": "Blackjack: Mog",
  "386": "Blackjack: Gau",
  "387": "Blackjack: Gogo",
  "388": "Blackjack: Umaro",
  "389": "Cave to the Sealed Gate: Ninja",
  "391": "Jidoor: Relm (Owzer's Basement)",
  "392": "Jidoor: Fat Owzer",
  "396": "Blackjack: Refreshments Sparkle",
  "399": "Jidoor: Chadarnook A",
  "400": "Jidoor: Chadarnook B",
  "401": "Jidoor: Chadarnook C",
  "402": "Jidoor: Emperor Painting",
  "498": "Jidoor: Ultros Painting",
  "495": "Blackjack: Unequip Guy",
  "507": "Cave to the Sealed Gate: Coin ???",
  "508": "Lete River: Raft (Cave 1)",
  "509": "Lete River: Raft (Cave 2)",
  "510": "Cave to the Sealed Gate: Rocks",
  "512": "Aways Visible",
  "513": "Local Control",
  "518": "Albrook Ship: Terra/Locke",
  "519": "Thamasa: Strago/Interceptor (Inn)",
  "520": "Albrook Ship: Shadow",
  "522": "Thamasa: Flames Behind Door",
  "529": "Doma Castle: Dead People",
  "531": "Albrook Docks: Shadow/Interceptor (Lower)",
  "536": "Thamasa: WoB NPC's (Exterior)",
  "538": "Thamasa: Shadow/Interceptor",
  "539": "Esper Mountain: Espers",
  "541": "Thamasa: Kefka/Soldiers",
  "542": "Thamasa: Party Characters (Kefka Attack)",
  "543": "Thamasa: Espers",
  "545": "Esper Mountain: Relm/Ultros (Statue Cave)",
  "546": "Albrook Docks: Shadow/Celes (Upper)",
  "580": "Cyan's Dream: NPC's (Cave)",
  "581": "Cyan's Dream: NPC's (Cliffs)",
  "587": "Gogo's Cave: Gogo",
  "588": "Cave in the Veldt: Interceptor (Entrance)",
  "594": "Cave in the Veldt: Shadow",
  "595": "Cave in the Veldt: Relm",
  "596": "Cave in the Veldt: Interceptor (Boss)",
  "597": "Cave in the Veldt: Monster",
  "598": "Thamasa: Shadow (In Bed)",
  "600": "Colosseum: NPC's",
  "601": "Thamasa: Elder (Elder's House)",
  "604": "Thamasa: Gungho (In Bed)",
  "605": "Ebot's Rock: Treasure Chest (event only)",
  "606": "Ebot's Rock: Hidon",
  "607": "Ebot's Rock: Strago",
  "610": "Thamasa: Shadow (Burning Building)",
  "614": "Thamasa: Relm (In Bed)",
  "759": "Local Control",
  "768": "Narshe: NPC's",
  "770": "Narshe: Arvis/Banon (Arvis' House)",
  "771": "Narshe: Arvis (Intro)",
  "772": "Narshe: NPC's (Intro)",
  "773": "Narshe: Tritoch (Intro)",
  "774": "Narshe: Locked Back Door (Arvis' House, Interior)",
  "775": "Narshe: Slave Crown",
  "776": "Narshe: Locked Back Door (Arvis' House, Exterior)",
  "777": "Narshe: 3-Party Moogles/Guards That Corner Terra",
  "778": "Narshe: 3-Party Monster A",
  "779": "Narshe: 3-Party Monster B",
  "780": "Narshe: 3-Party Monster C",
  "781": "Narshe: 3-Party Monster D",
  "782": "Narshe: 3-Party Monster E",
  "783": "Narshe: 3-Party Monster F",
  "784": "Narshe: Blocked Exits in 3-Party Cave",
  "785": "Figaro Castle: Kefka/Soldiers (Empty Desert)",
  "787": "Narshe: Tritoch (Cliffs, WoB)",
  "788": "Narshe: NPC's (Cliffs, WoB)",
  "789": "Narshe: Locke (Arvis' House)",
  "790": "Narshe: Celes (Arvis' House)",
  "791": "Narshe: Edgar (Arvis' House)",
  "792": "Narshe: Sabin (Arvis' House)",
  "793": "Narshe: Gau (Arvis' House)",
  "794": "Narshe: Cyan (Arvis' House)",
  "810": "Narshe: Guards at Front Entrance",
  "811": "Vector: NPC's",
  "812": "Vector: Gestahl Speech NPC's",
  "815": "Vector: Soldiers (Banquet)",
  "817": "Narshe: Marshal/Terra",
  "818": "Save Point",
  "819": "Narshe: Save Point (Hills Maze)",
  "820": "Vector: Soldiers (Banquet)",
  "822": "Vector: Sabin",
  "827": "Vector: Returner Sympathizer",
  "829": "Narshe: Treasure House NPC's",
  "830": "Narshe: Lone Wolf (Treasure House)",
  "831": "Narshe: Lone Wolf (WoB)",
  "832": "Narshe: Lone Wolf/Mog (Cliffs)",
  "833": "Narshe: Blocked Bridge (Cliffs)",
  "834": "Narshe: Moogles (Moogle Cave, WoB)",
  "835": "Narshe: Mog (Moogle Cave, WoB)",
  "836": "Magitek Research Facility: Map NPC's",
  "837": "Magitek Research Facility: Event NPC's",
  "838": "Magitek Factory: Ifrit/Shiva",
  "839": "Magitek Factory: Ifrit Magicite",
  "840": "Magitek Factory: Shiva Magicite",
  "841": "Magitek Research Facility: Number 024",
  "842": "Magitek Research Facility: Espers (Esper Room)",
  "843": "Magitek Research Facility: Blocked Door (Esper Room)",
  "844": "Vector: Guardian",
  "845": "Vector: Blocked Magitek Factory",
  "846": "Narshe: Arvis/Banon/Elder (Elder's House)",
  "847": "Kohlingen: NPC's (WoB/Interior)",
  "848": "Kohlingen: Rachel Flashback NPC's",
  "850": "Vector: NPC's (On Fire)",
  "856": "Narshe: Checkpoint Sparkles",
  "857": "Umaro's Cave: Skull Statue",
  "858": "Umaro's Cave: Terrato Magicite",
  "859": "Umaro's Cave: Umaro",
  "862": "Albrook: NPC's (WoB/Interior)",
  "863": "Albrook: Soldiers (Exterior)",
  "864": "Albrook: Celes",
  "865": "Albrook: Soldiers (Cafe/Docks)",
  "866": "Tzen: NPC's (WoB/Interior)",
  "867": "Tzen: Soldiers",
  "869": "Albrook: NPC's (WoR)",
  "870": "Tzen: Magicite Guy",
  "872": "Tzen: NPC's (WoR)",
  "874": "Tzen: NPC's (Collapsing House)",
  "876": "Tzen: Sabin",
  "877": "Tzen: Boy in Collapsing House",
  "888": "Fanatics' Tower: NPC's (Bottom)",
  "889": "Fanatics' Tower: Strago",
  "890": "Maranda: Lola w/o Flowers",
  "891": "Maranda: Lola/Flowers",
  "894": "Kohlingen: NPC's (WoR)",
  "896": "Kohlingen: Birds",
  "897": "Mt. Zozo: Flowers/Letter",
  "898": "Mt. Zozo: Cyan",
  "899": "Mt. Zozo: Flying Bird",
  "900": "Mt. Zozo: Cyan's Treasure Chest",
  "901": "Mt. Zozo: Key to Cyan's Treasure Chest",
  "902": "Mt. Zozo: Storm Dragon",
  "903": "Phoenix Cave: Magicite",
  "904": "Narshe: Locked Front Door (Arvis' House)",
  "906": "Narshe: Tritoch/Ragnarok Magicite",
  "907": "Colosseum: Imperial Soldier",
  "908": "Narshe: Tritoch (Cliffs, WoR)",
  "909": "Narshe: Mog (Moogle Cave, WoR)",
  "910": "Kohlingen: Crazy Man 1",
  "911": "Kohlingen: Crazy Man 2",
  "912": "Narshe: Beginner's House NPC's",
  "913": "Narshe: Beginner's House Ghost",
  "914": "Chocobo Stable: NPC's",
  "915": "Phoenix Cave: Crane Hook/Exit Warp",
  "916": "Fanatics' Tower: White Dragon",
  "917": "Narshe: Ice Dragon",
  "918": "Ancient Castle: Odin",
  "919": "Ancient Castle: Queen Statue",
  "920": "Phoenix Cave: Locke",
  "921": "Fanatics' Tower: NPC's (Top)",
  "923": "Ancient Castle: NPC's",
  "924": "Phoenix Cave: Red Dragon",
  "928": "Ancient Castle: Queen's Diary",
  "929": "Ancient Castle: Blue Dragon",
  "930": "Narshe: Man Outside Beginner's House",
  "931": "Vector: Train Car and Soldier",
  "932": "Kefka's Tower: Floor Switches",
  "933": "Kefka's Tower: Left Weight (Top)",
  "935": "Kefka's Tower: Right Weight (Top)",
  "936": "Maranda: Letter (Lola's House)",
  "938": "Kefka's Tower: Left Weight (Bottom)",
  "939": "Kefka's Tower: Right Weight (Bottom)",
  "940": "Banon's House: Banon (Exterior)",
  "941": "Narshe: Ragnarok/Cursed Shield Guys",
  "942": "Vector: Blocked Entrance to Magitek Factory",
  "943": "Kefka's Tower: Treasure Chest Switch",
  "944": "Kefka's Tower: Doom",
  "945": "Kefka's Tower: Goddess",
  "946": "Kefka's Tower: Poltergeist",
  "947": "Kefka's Tower: Gold Dragon",
  "948": "Kefka's Tower: Skull Dragon",
  "949": "Banon's House: Banon A",
  "950": "Kohlingen: Old Man (Unequip)",
  "952": "Kefka's Tower: Doom Save Point",
  "953": "Kefka's Tower: Goddess Save Point",
  "954": "Kefka's Tower: Guardian Event",
  "955": "Kefka's Tower: Guardian Sprites",
  "956": "Kefka's Tower: Inferno",
  "957": "Kefka's Tower: Atma",
  "958": "Kefka's Tower: Atma Save Point",
  "959": "Banon's House: Banon B",
  "960": "Narshe: Locked Inn",
  "961": "Narshe: Locked Weapon Shop",
  "962": "Narshe: Locked Relic Shop",
  "963": "Narshe: Locked Treasure Room",
  "964": "Narshe: Locked Building",
  "965": "Narshe: Locked Weapon Shop",
};

export function getEventBitName(bit: number) {
  if (bit < 768) {
    return `Map bit ${bit}: ${mapBits[bit] || "Unknown"}`;
  } else {
    return `NPC bit ${bit - 768}: ${npcBits[bit - 768] || "Unknown"}`;
  }
}