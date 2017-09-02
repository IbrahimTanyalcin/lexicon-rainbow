////////////////////////////////////////////////////////////////////
//////////////////////////////THE DATA//////////////////////////////
////////////////////////////////////////////////////////////////////
var sample = {
	"ordinal": [
		{
			"colors": {
				"Clinton":["LightBlue","LightBlue","Blue","DarkBlue"],
				"Trump": ["Pink","Pink","Red","DarkRed"],
				"Others": ["Green","Green","LightGreen","DarkGreen"]
			},
			"name": "All candidates",
			"categories": {
				"Clinton": 1,
				"Trump": 2,
				"Others": 3
			},
			"mode":"stack",
			"Info": "Pooled vote counts of all candidates",
			"partition":true
		},
		{
			"colors": {
				"Clinton":["LightBlue","LightBlue","Blue","DarkBlue"],
				"Trump": ["Pink","Pink","Red","DarkRed"],
				"Others": ["Green","Green","LightGreen","DarkGreen"]
			},
			"name": "All candidates - Eq",
			"categories": {
				"Clinton": 1,
				"Trump": 2,
				"Others": 3
			},
			"mode":"stackEqual",
			"Info": "Pooled vote counts, but equal separation on the top scale"
		},
		{
			"colors": {
				"Clinton":["LightBlue","LightBlue","Blue","DarkBlue"],
				"Trump": ["Pink","Pink","Red","DarkRed"],
				"Others": ["Green","Green","LightGreen","DarkGreen"]
			},
			"name": "Trump - Eq",
			"categories": {
				"Trump": 1
			},
			"mode":"stackEqual",
			"Info": "Vote counts of Trump"
		},
		{
			"colors": {
				"Clinton":["LightBlue","LightBlue","Blue","DarkBlue"],
				"Trump": ["Pink","Pink","Red","DarkRed"],
				"Others": ["Green","Green","LightGreen","DarkGreen"]
			},
			"name": "Clinton - Eq",
			"categories": {
				"Clinton": 1
			},
			"mode":"stackEqual",
			"Info": "Vote counts of Clinton"
		},
		{
			"colors": {
				"Arizona":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Arizona",
			"categories": {
				"Arizona": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Colorado":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Colorado",
			"categories": {
				"Colorado": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Florida":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Florida",
			"categories": {
				"Florida": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Iowa":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Iowa",
			"categories": {
				"Iowa": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Maine":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Maine",
			"categories": {
				"Maine": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Michigan":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Michigan",
			"categories": {
				"Michigan": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Minnesota":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Minnesota",
			"categories": {
				"Minnesota": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Nevada":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Nevada",
			"categories": {
				"Nevada": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"New Hampshire":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "New Hampshire",
			"categories": {
				"New Hampshire": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"North Carolina":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "North Carolina",
			"categories": {
				"North Carolina": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Ohio":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Ohio",
			"categories": {
				"Ohio": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Pennsylvania":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Pennsylvania",
			"categories": {
				"Pennsylvania": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Wisconsin":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Wisconsin",
			"categories": {
				"Wisconsin": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Alabama":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Alabama",
			"categories": {
				"Alabama": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Alaska":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Alaska",
			"categories": {
				"Alaska": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Arkansas":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Arkansas",
			"categories": {
				"Arkansas": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"California":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "California",
			"categories": {
				"California": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Connecticut":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Connecticut",
			"categories": {
				"Connecticut": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Delaware":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Delaware",
			"categories": {
				"Delaware": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"District of Columbia":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "District of Columbia",
			"categories": {
				"District of Columbia": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Georgia":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Georgia",
			"categories": {
				"Georgia": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Hawaii":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Hawaii",
			"categories": {
				"Hawaii": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Idaho":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Idaho",
			"categories": {
				"Idaho": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Illinois":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Illinois",
			"categories": {
				"Illinois": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Indiana":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Indiana",
			"categories": {
				"Indiana": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Kansas":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Kansas",
			"categories": {
				"Kansas": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Kentucky":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Kentucky",
			"categories": {
				"Kentucky": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Louisiana":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Louisiana",
			"categories": {
				"Louisiana": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Maryland":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Maryland",
			"categories": {
				"Maryland": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Massachusetts":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Massachusetts",
			"categories": {
				"Massachusetts": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Mississippi":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Mississippi",
			"categories": {
				"Mississippi": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Missouri":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Missouri",
			"categories": {
				"Missouri": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Montana":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Montana",
			"categories": {
				"Montana": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Nebraska":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Nebraska",
			"categories": {
				"Nebraska": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"New Jersey":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "New Jersey",
			"categories": {
				"New Jersey": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"New Mexico":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "New Mexico",
			"categories": {
				"New Mexico": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"New York":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "New York",
			"categories": {
				"New York": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"North Dakota":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "North Dakota",
			"categories": {
				"North Dakota": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Oklahoma":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Oklahoma",
			"categories": {
				"Oklahoma": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Oregon":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Oregon",
			"categories": {
				"Oregon": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Rhode Island":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Rhode Island",
			"categories": {
				"Rhode Island": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"South Carolina":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "South Carolina",
			"categories": {
				"South Carolina": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"South Dakota":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "South Dakota",
			"categories": {
				"South Dakota": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Tennessee":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Tennessee",
			"categories": {
				"Tennessee": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Texas":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Texas",
			"categories": {
				"Texas": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Utah":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Utah",
			"categories": {
				"Utah": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Vermont":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Vermont",
			"categories": {
				"Vermont": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Virginia":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Virginia",
			"categories": {
				"Virginia": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Washington":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Washington",
			"categories": {
				"Washington": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"West Virginia":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "West Virginia",
			"categories": {
				"West Virginia": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		},
		{
			"colors": {
				"Wyoming":["Orange","LightBlue","Pink","Green","DarkSlateGray"]
			},
			"name": "Wyoming",
			"categories": {
				"Wyoming": 1
			},
			"mode":"stack",
			"Info": "Vote counts from selected state"
		}
	],
	"linear": [
		{
			"domain": [
				0,
				140000000
			],
			"format":".3s",
			"name": "All candidates(C,T,O)",
			"categories": {
				"Clinton": {intervals:[
					65853516
				],names:["Clinton"]},
				"Trump": {intervals:[
					62984824
				],names:["Trump"]},
				"Others": {intervals:[
					7801446
				],names:["Others"]}
			},
			"glyph": "./usFlag.png",
			"mode":"stack",
			"gMode":"stack",
			"Info": "Total vote counts stacked"
		},
		{
			"domain": [
				0,
				140000000
			],
			"format":".3s",
			"name": "C,T,O compare",
			"categories": {
				"Clinton": "0",
				"Trump": "0",
				"Others": "0"
			},
			"glyph": "./usFlag.png",
			"mode":"stack",
			"Info": "Total vote counts stacked & compared between candidates"
		},
		{
			"domain": [
				0,
				65853516
			],
			"format":".3s",
			"name": "C-states",
			"categories": {
				"Clinton": {intervals:[
						1161167,1338870,4504975,653669,357735,2268839,1367716,
					539260,348526,2189316,2394164,2926441,1382536,
					729547,116454,380494,8753788,897572,235603,
					282830,1877963,266891,189765,3090729,1033126,
					427005,628854,780154,1677928,1995196,485131,
					1071068,177709,284494,2148278,385234,4556124,
					93758,420375,1002106,252525,855373,117458,
					870695,3877868,310676,178573,1981473,1742718,
					188794,55973
				],names:["Arizona","Colorado","Florida","Lowa","Maine","Michigan",
				"Minnesota","Nevada","New Hampshire","North Carolina","Ohio","Pennsylvania",
				"Wisconsin","Alabama","Alaska","Arkansas","California","Connecticut",
				"Delaware","District of Columbia","Georgia","Hawaii","Idaho","Illinois",
				"Indiana","Kansas","Kentucky","Lousiana","Maryland","Massachusetts",
				"Mississippi","Misouri","Montana","Nebraska","New Jersey","New Mexico",
				"New York","North Dakota","Oklahoma","Oregon","Rhode Island","South Carolina",
				"South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington",
				"West Virginia","Wyoming"]}
			},
			"glyph": "./usFlag.png",
			"mode":"stack",
			"Info": "Clinton - state votes stacked"
		},
		{
			"domain": [
				0,
				10000000
			],
			"format":".3s",
			"name": "C-states-sort(>)",
			"categories": {
				"Clinton": 2
			},
			"glyph": "./usFlag.png",
			"mode":"intervalize",
			"sort":">",
			"Info": "Clinton - state votes compared and sorted by increasing vote count"
		},
		{
			"domain": [
				0,
				10000000
			],
			"format":".3s",
			"name": "C-states-sort(<)",
			"categories": {
				"Clinton": 2
			},
			"glyph": "./usFlag.png",
			"mode":"intervalize",
			"sort":"<",
			"Info": "Clinton - state votes compared and sorted by decreasing vote count"
		},
		{
			"domain": [
				0,
				10000000
			],
			"format":".3s",
			"name": "C-states-sort(s<)",
			"categories": {
				"Clinton": 2
			},
			"glyph": "./usFlag.png",
			"mode":"intervalize",
			"sort":"s<",
			"Info": "Clinton - state votes compared and sorted by decreasing alphabetical order"
		},
		{
			"domain": [
				0,
				10000000
			],
			"format":".3s",
			"name": "C-states-sort(s>)",
			"categories": {
				"Clinton": 2
			},
			"glyph": "./usFlag.png",
			"mode":"intervalize",
			"sort":"s>",
			"Info": "Clinton - state votes compared and sorted by increasing alphabetical order"
		},
		{
			"domain": [
				0,
				65853516
			],
			"format":".3s",
			"name": "C-states-sort(s>)",
			"categories": {
				"Clinton": 2
			},
			"glyph": "./usFlag.png",
			"gMode":"stack",
			"sort":"s>",
			"mode":"stack",
			"Info": "Clinton - state votes stacked and sorted by increasing alphabetical order"
		},
		{
			"domain": [
				0,
				65853516
			],
			"format":".3s",
			"name": "T-states-sort(s>)",
			"categories": {
				"Trump": 9
			},
			"axis":"DarkSlateGray",
			"glyph": "./usFlag.png",
			"gMode":"stack",
			"sort":"s>",
			"mode":"stack",
			"Info": "Trump - state votes stacked and sorted by increasing alphabetical order"
		},
		{
			"domain": [
				0,
				140000000
			],
			"format":".3s",
			"name": "C,T-states-sort(s>)",
			"categories": {
				"Clinton": 2,
				"Trump":{intervals:[
						1252401,1202484,4617886,800983,335593,2279543,1322951,
					512058,345790,2362631,2841005,2970733,1405284,
					1318255,163387,684872,4483810,673215,185127,
					12723,2089104,128847,409055,2146015,1557286,
					671018,1202971,1178638,943169,1090893,700714,
					1594511,279240,495961,1601933,319666,2819534,
					216794,949136,782403,180543,1155389,227721,
					1522925,4685047,515231,95369,1769443,1221747,
					489371,174419
				],names:["Arizona","Colorado","Florida","Lowa","Maine","Michigan",
				"Minnesota","Nevada","New Hampshire","North Carolina","Ohio","Pennsylvania",
				"Wisconsin","Alabama","Alaska","Arkansas","California","Connecticut",
				"Delaware","District of Columbia","Georgia","Hawaii","Idaho","Illinois",
				"Indiana","Kansas","Kentucky","Lousiana","Maryland","Massachusetts",
				"Mississippi","Misouri","Montana","Nebraska","New Jersey","New Mexico",
				"New York","North Dakota","Oklahoma","Oregon","Rhode Island","South Carolina",
				"South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington",
				"West Virginia","Wyoming"]}
			},
			"glyph": "./usFlag.png",
			"gMode":"stack",
			"sort":"s>",
			"mode":"stack",
			"Info": "Clinton & Trump - state votes stacked and sorted by increasing alphabetical order"
		},
		{
			"domain": [
				0,
				15000000
			],
			"format":".3s",
			"name": "C,T-states-sort(s>)",
			"categories": {
				"Clinton": 2,
				"Trump":9
			},
			"glyph": "./usFlag.png",
			"gMode":"stack",
			"sort":"s>",
			"mode":"intervalize",
			"Info": "Clinton & Trump - state votes compared and sorted by increasing alphabetical order"
		},
		{
			"domain": [
				0,
				140000000
			],
			"format":".3s",
			"name": "C,T-states-sort(>)",
			"categories": {
				"Clinton": 2,
				"Trump":9
			},
			"glyph": "./usFlag.png",
			"gMode":"stack",
			"sort":">",
			"mode":"stack",
			"Info": "Clinton & Trump - state votes stacked and sorted by increasing vote count"
		},
		{
			"domain": [
				0,
				65853516
			],
			"format":".3s",
			"name": "C,T-states-sort(>)",
			"categories": {
				"Clinton": 2,
				"Trump":9
			},
			"glyph": "./usFlag.png",
			"gMode":"justify",
			"sort":">",
			"mode":"stack",
			"Info": "Clinton & Trump - state votes stacked and sorted by increasing vote count with fixed interval"
		},
		{
			"domain": [
				0,
				10000000
			],
			"format":".3s",
			"name": "Individual States",
			"categories": {
				"Arizona": {intervals:[1161167,1252401,159597],names:["Clinton","Trump","Others"]},
				"Colorado": {intervals:[1338870,1202484,238866],names:["Clinton","Trump","Others"]},
				"Florida": {intervals:[4504975,4617886,297178],names:["Clinton","Trump","Others"]},
				"Iowa": {intervals:[653669,800983,111379],names:["Clinton","Trump","Others"]},
				"Maine": {intervals:[357735,335593,54599],names:["Clinton","Trump","Others"]},
				"Michigan": {intervals:[2268839,2279543	,250902],names:["Clinton","Trump","Others"]},
				"Minnesota": {intervals:[1367716,1322951,254146],names:["Clinton","Trump","Others"]},
				"Nevada": {intervals:[539260,512058,74067],names:["Clinton","Trump","Others"]},
				"New Hampshire": {intervals:[348526,345790,49842],names:["Clinton","Trump","Others"]},
				"North Carolina": {intervals:[2189316,2362631,189617],names:["Clinton","Trump","Others"]},
				"Ohio": {intervals:[2394164,2841005,261318],names:["Clinton","Trump","Others"]},
				"Pennsylvania": {intervals:[2926441,2970733,218228],names:["Clinton","Trump","Others"]},
				"Wisconsin": {intervals:[1382536,1405284,188330],names:["Clinton","Trump","Others"]},
				"Alabama": {intervals:[729547,1318255,75570],names:["Clinton","Trump","Others"]},
				"Alaska": {intervals:[116454,163387,38767],names:["Clinton","Trump","Others"]},
				"Arkansas": {intervals:[380494,684872,65269],names:["Clinton","Trump","Others"]},
				"California": {intervals:[8753788,4483810,943997],names:["Clinton","Trump","Others"]},
				"Connecticut": {intervals:[897572,673215,74133],names:["Clinton","Trump","Others"]},
				"Delaware": {intervals:[235603,185127,20860],names:["Clinton","Trump","Others"]},
				"District of Columbia": {intervals:[282830,12723,15715],names:["Clinton","Trump","Others"]},
				"Georgia": {intervals:[1877963,2089104,125306],names:["Clinton","Trump","Others"]},
				"Hawaii": {intervals:[266891,128847,33199],names:["Clinton","Trump","Others"]},
				"Idaho": {intervals:[189765,409055,91435],names:["Clinton","Trump","Others"]},
				"Illinois": {intervals:[3090729,2146015,299680],names:["Clinton","Trump","Others"]},
				"Indiana": {intervals:[1033126,1557286,144546],names:["Clinton","Trump","Others"]},
				"Kansas": {intervals:[427005,671018,86379],names:["Clinton","Trump","Others"]},
				"Kentucky": {intervals:[628854,1202971,92324],names:["Clinton","Trump","Others"]},
				"Louisiana": {intervals:[780154,1178638,70240],names:["Clinton","Trump","Others"]},
				"Maryland": {intervals:[1677928,943169,160349],names:["Clinton","Trump","Others"]},
				"Massachusetts": {intervals:[1995196,1090893,238957],names:["Clinton","Trump","Others"]},
				"Mississippi": {intervals:[485131,700714,23512],names:["Clinton","Trump","Others"]},
				"Missouri": {intervals:[1071068,1594511,143026],names:["Clinton","Trump","Others"]},
				"Montana": {intervals:[177709,279240,40198],names:["Clinton","Trump","Others"]},
				"Nebraska": {intervals:[284494,495961,63772],names:["Clinton","Trump","Others"]},
				"New Jersey": {intervals:[2148278,1601933,123835],names:["Clinton","Trump","Others"]},
				"New Mexico": {intervals:[385234,319666,93418],names:["Clinton","Trump","Others"]},
				"New York": {intervals:[4556124,2819534,345795],names:["Clinton","Trump","Others"]},
				"North Dakota": {intervals:[93758,216794,33808],names:["Clinton","Trump","Others"]},
				"Oklahoma": {intervals:[420375,949136,83481],names:["Clinton","Trump","Others"]},
				"Oregon": {intervals:[1002106,782403,216827],names:["Clinton","Trump","Others"]},
				"Rhode Island": {intervals:[252525,180543,31076],names:["Clinton","Trump","Others"]},
				"South Carolina": {intervals:[855373,1155389,92265],names:["Clinton","Trump","Others"]},
				"South Dakota": {intervals:[117458,227721,24914],names:["Clinton","Trump","Others"]},
				"Tennessee": {intervals:[870695,1522925,114407],names:["Clinton","Trump","Others"]},
				"Texas": {intervals:[3877868,4685047,406311],names:["Clinton","Trump","Others"]},
				"Utah": {intervals:[310676,515231,305523],names:["Clinton","Trump","Others"]},
				"Vermont": {intervals:[178573,95369,41125],names:["Clinton","Trump","Others"]},
				"Virginia": {intervals:[1981473,1769443,231836],names:["Clinton","Trump","Others"]},
				"Washington": {intervals:[1742718,1221747,401179],names:["Clinton","Trump","Others"]},
				"West Virginia": {intervals:[188794,489371,34886],names:["Clinton","Trump","Others"]},
				"Wyoming": {intervals:[55973,174419,25457],names:["Clinton","Trump","Others"]}
			},
			"glyph": "./usFlag.png",
			"mode":"stack",
			"Info":"Individual vote vounts Stacked from each state"
		},
		{
			"domain": [
				0,
				65853516
			],
			"axis":"DarkSlateGray",
			"format":".3s",
			"name": "C-states-sort (s>)",
			"categories": {
				"Clinton": 2
			},
			"sort":"s>",
			"glyph": "./usFlag.png",
			"mode":"stack",
			"Info": "Clinton - state votes stacked and sorted by increasing alphabetical order"
		}
	]
};