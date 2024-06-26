const LYT =
{
    "$": {
        "": ".fyg_head, .fyg_foot",
        "gm": ".fyg_head, .fyg_gm, .fyg_foot",
        "login": ".fyg_head, .fyg_login, .fyg_foot",
        "index": ".fyg_head, .fyg_index, .fyg_foot",
        "pk": ".fyg_head, .fyg_pk, .fyg_foot",
        "equip": ".fyg_head, .fyg_equip, .fyg_foot",
        "wish": ".fyg_head, .fyg_wish, .fyg_foot",
        "beach": ".fyg_head, .fyg_beach, .fyg_foot",
        "gift": ".fyg_head, .fyg_gift, .fyg_foot",
        "shop": ".fyg_head, .fyg_shop, .fyg_foot",
        "stat": ".fyg_head, .fyg_stat, .fyg_foot",
        "byebye": ".fyg_head, .fyg_byebye, .fyg_foot",
    },
    "fyg": {
        "Wallet": ["coin1", "coin2", "coin3"],
        "Depot": ["3001", "3002", "3003", "3004", "3005", "3301", "3302", "3303", "3309", "3310"],
        "Bill": ["coin1", "coin2", "coin3", "actor", "equip", "fruit", "craft", "spawn", "amass", "3001", "3002", "3003", "3004", "3005", "3301", "3302", "3303", "3309", "3310"],
        "Stat": ["str", "agi", "int", "vit", "spr", "mnd"],
        "Equip": {
            "Mul": 1, "Add": 0,
            "Tier": [80, 100, 120, 130]
        }
    },
    "gm": {
        "Arena": {
            "Clock": "Clock",
            "Scales": "Scales", 
            "Rounds": "Rounds",
            "SpdMin": "SpdMin", 
            "SklAdd": "SklAdd", 
            "CrtAdd": "CrtAdd",
            "SklOff": "SklOff", 
            "CrtOff": "CrtOff",
            "HpHeal": "HpHeal", 
            "SdHeal": "SdHeal",
            "RflMtL": "RflMtL",
            "RflMtR": "RflMtR",
            "LchMtL": "LchMtL", 
            "LchMtR": "LchMtR"
        },
        "Unit": {
            "Grade": ["$Grade"],
            "Actor": ["$Actor"],
            "Level": ["$Level"],
            "Trait": ["$Trait"],
            "Build": ["$Build"],
            "Skill": ["$Skill"],
            "Growth": ["$Growth"],
            "HpRat": ["$HpRat"],
            "HpMax": ["$HpMaxMul", "$HpMaxAdd"],
            "HpHealRat": ["$HpHealRat"],
            "HpHealFix": ["$HpHealMul", "$HpHealAdd"],
            "SdRat": ["$SdRat"],
            "SdMax": ["$SdMaxMul", "$SdMaxAdd"],
            "SdHealRat": ["$SdHealRat"],
            "SdHealFix": ["$SdHealMul", "$SdHealAdd"],
            "RecRat": ["$RecRat"],
            "PowRatP": ["$PowRatP"],
            "PowFixP": ["$PowMulP", "$PowAddP"],
            "PowRatM": ["$PowRatM"],
            "PowFixM": ["$PowMulM", "$PowAddM"],
            "PowRatC": ["$PowRatC"],
            "PowRatS": ["$PowRatS"],
            "PowFixA": ["$PowMulA", "$PowAddA"],
            "ResRatP": ["$ResRatP"],
            "ResFixP": ["$ResMulP", "$ResAddP"],
            "ResRatM": ["$ResRatM"],
            "ResFixM": ["$ResMulM", "$ResAddM"],
            "ResRatC": ["$ResRatC"],
            "ResRatS": ["$ResRatS"],
            "SpdRat": ["$SpdRat"],
            "SpdFix": ["$SpdMul", "$SpdAdd"],
            "AtkRatP": ["$AtkRatP"],
            "AtkFixP": ["$AtkMulP", "$AtkAddP"],
            "AtkRatM": ["$AtkRatM"],
            "AtkFixM": ["$AtkMulM", "$AtkAddM"],
            "AtkRatC": ["$AtkRatC"],
            "AtkFixC": ["$AtkMulC", "$AtkAddC"],
            "DefRatP": ["$DefRatP", "$DefFixP"],
            "DefFixP": ["$DefMulP", "$DefAddP"],
            "DefRatM": ["$DefRatM", "$DefFixM"],
            "DefFixM": ["$DefMulM", "$DefAddM"],
            "SklRat": ["$SklRat", "$SklFix"],
            "SklAdd": ["$SklMul", "$SklAdd"],
            "CrtRat": ["$CrtRat", "$CrtFix"],
            "CrtAdd": ["$CrtMul", "$CrtAdd"],
            "EvaRat": ["$EvaRat", "$EvaFix"],
            "EvaAdd": ["$EvaMul", "$EvaAdd"],
            "DodRat": ["$DodRat", "$DodFix"],
            "DodAdd": ["$DodMul", "$DodAdd"],
            "LchRat": ["$LchRat", "$LchFix"],
            "RflRat": ["$RflRat", "$RflFix"],
            "Str": ["$Str"],
            "Agi": ["$Agi"],
            "Int": ["$Int"],
            "Vit": ["$Vit"],
            "Spr": ["$Spr"],
            "Mnd": ["$Mnd"],
            "HandyAtk": ["$HndAtk"],
            "HandyDef": ["$HndDef"]
        },
        "UnitWishs": [
            "ph",
            "ps",
            "a1",
            "a2",
            "a3",
            "pp",
            "pm",
            "hp",
            "sd",
            "sp",
            "ap",
            "am",
            "dp",
            "dm"
        ],
        "UnitGems": [
            "1", "2", "3", "4", "5", "6"
        ],
        "UnitDice": [
            "L",
            "X",
            "h",
            "a",
            "d",
            "l",
            "r",
            "c",
            "z"
        ],
        "UnitArt1": [
            "3000", "3001", "3002", "3003", "3004", "3005", "3006", "3007", "3008", "3009", "3010", "3011",
            "3901", "3902", "3903", "3904", "3905", "3906"
        ],
        "UnitArt2": [
            "3000", "3001", "3002", "3003", "3004", "3005", "3006", "3007", "3008", "3009", "3010", "3011",
            "3901", "3902", "3903", "3904", "3905", "3906"
        ],
        "UnitArt3": [
            "3000", "3001", "3002", "3003", "3004", "3005", "3006", "3007", "3008", "3009", "3010", "3011",
            "3901", "3902", "3903", "3904", "3905", "3906"
        ],
        "UnitAura": [
            "101", "102", "103", "104", "105",
            "201", "202", "203", "204", "205", "206", "207",
            "301", "302", "303", "304", "305", "306", "307", "308", "309",
            "401", "402", "403", "404", "405", "406", "407", "408",
            "901"
        ],
        "UnitMyst": [
            "901", "902", "903",
            "2101", "2102", "2103", "2104", "2105", "2106", "2107", "2108", "2109", "2110", "2111", "2112",
            "2201", "2202", "2203", "2204", "2205", "2206",
            "2301", "2302", "2303", "2304", "2305", "2306", "2307",
            "2401", "2402", "2403", "2404", "2405"
        ],
        "UnitStatus": [
            "HpMax",
            "SdMax",
            "HpRecRat",
            "SdRecRat",
            "PowRatP",
            "PowRatM",
            "PowRatC",
            "PowRatS",
            "PowFixP",
            "PowFixM",
            "PowFixA",
            "ResRatP",
            "ResRatM",
            "ResRatC",
            "ResRatS",
            "AtkRatP",
            "AtkRatM",
            "AtkRatC",
            "AtkFixP",
            "AtkFixM",
            "AtkFixC",
            "DefRatP",
            "DefRatM",
            "DefFixP",
            "DefFixM",
            "SpdRat",
            "SklRat",
            "CrtRat",
            "EvaRat",
            "DodRat",
            "LchRat",
            "RflRat",
            "NoCrt",
            "NoSkl",
            "NoRec",
            "Undead",
            "Flare",
            "Light",
            "Dodge",
            "Sight",
            "Mirror"
        ],
        "EditorUser": {
            "Grade": "grade",
            "HandyAtk": "atk",
            "HandyDef": "def"
        },
        "EditorActor": {
            "Level": "L",
            "Trait": "Q",
            "Skill": "S",
            "Build": "B",
            "Flair": "F",
            "Growth": "G",
            "Str": "str",
            "Agi": "agi",
            "Int": "int",
            "Vit": "vit",
            "Spr": "spr",
            "Mnd": "mnd"
        },
        "EditorWishs": [
            "ph", "ps",
            "a1", "a2", "a3",
            "pp", "pm", 
            "hp", "sd",
            "sp", "ap", "am", "dp", "dm"
        ],
        "EditorAmulet": [
            "str", "agi", "int",
            "vit", "spr", "mnd",
            "pp", "pm", "pc",
            "ps", "rp", "rm",
            "rc", "rs", "ap",
            "am", "dp", "dm",
            "crt", "skl", "dod",
            "eva", "spd", "rec",
            "hp", "sd", "lch",
            "rfl"
        ],
        "EditorAura": [
            "101", "102", "103", "104", "105",
            "201", "202", "203", "204", "205", "206", "207",
            "301", "302", "303", "304", "305", "306", "307", "308", "309",
            "401", "402", "403", "404", "405", "406", "407", "408",
            "901"
        ],
        "EditorGems": [
            "1", "2", "3", "4", "5", "6"
        ],
        "EditorDice": [
            "L",
            "X",
            "h",
            "a",
            "d",
            "l",
            "r",
            "c",
            "z"
        ],
        "ActorKind": [
            "0",
            "3000", "3001", "3002", "3003", "3004", "3005", "3006", "3007", "3008", "3009", "3010", "3011",
            "3901", "3902", "3903", "3904", "3905", "3906", "3907", "3908"
        ],
        "EquipKind": [
            "0",
            "901", "902", "903",
            "2101", "2102", "2103", "2104", "2105", "2106", "2107", "2108", "2109", "2110", "2111", "2112",
            "2201", "2202", "2203", "2204", "2205", "2206",
            "2301", "2302", "2303", "2304", "2305", "2306", "2307",
            "2401", "2402", "2403", "2404", "2405"
        ],
        "EquipRank": [
            "1", "2", "3", "4", "5"
        ],
        "AuraCost": {
            "101": 0, "102": 0, "103": 0, "104": 0, "105": 0,
            "201": 20, "202": 20, "203": 20, "204": 20, "205": 20, "206": 20, "207": 20,
            "301": 30, "302": 30, "303": 30, "304": 30, "305": 30, "306": 30, "307": 30, "308": 30, "309": 30,
            "401": 100, "402": 100, "403": 100, "404": 100, "405": 100, "406": 100, "407": 100, "408": 100,
            "901": 999
        }
    },
    "equip": {
        "Status": [
            {kind: "HpMax", type: "success", attr: [["nHpMaxMul", " + "], ["nHpMaxAdd", ""]]},
            {kind: "HpHeal", type: "success", attr: [["nHpHealRat", "% + "], ["nHpHealAdd", ""]]},
            {kind: "PowP", type: "danger", attr: [["nPowMulP", " + "], ["nPowAddP", ""]]},
            {kind: "PowM", type: "primary", attr: [["nPowMulM", " + "], ["nPowAddM", ""]]},
            {kind: "PowA", type: "special", attr: [["nPowMulA", " + "], ["nPowAddA", ""]]},
            {kind: "Spd", type: "special", attr: [["nSpdMul", " + "], ["nSpdAdd", ""]]},
            {kind: "AtkP", type: "danger", attr: [["nAtkRatP", "% + "], ["nAtkMulP", " + "], ["nAtkAddP", ""]]},
            {kind: "AtkM", type: "primary", attr: [["nAtkRatM", "% + "], ["nAtkMulM", " + "], ["nAtkAddM", ""]]},
            {kind: "Skl", type: "special", attr: [["nSklMul", " + "], ["nSklAdd", ""]]},
            {kind: "Crt", type: "special", attr: [["nCrtMul", " + "], ["nCrtAdd", ""]]},
            {kind: "AtkC", type: "special", attr: [["nAtkRatC", "%"]]},
            {kind: "Lch", type: "success", attr: [["nLchRat", "%"]]},
            {kind: "DefP", type: "danger", attr: [["nDefMulP", " + "], ["nDefAddP", ""]]},
            {kind: "DefM", type: "primary", attr: [["nDefMulM", " + "], ["nDefAddM", ""]]},
            {kind: "ResP", type: "danger", attr: [["nResAddP", ""]]},
            {kind: "ResM", type: "primary", attr: [["nResAddM", ""]]},
            {kind: "SdMax", type: "success", attr: [["nSdMaxMul", " + "], ["nSdMaxAdd", ""]]},
            {kind: "SdHeal", type: "success", attr: [["nSdHealRat", "% + "], ["nSdHealAdd", ""]]},
            {kind: "Rfl", type: "special", attr: [["nRflRat", "%"]]}
        ],
        "Items": [
            "3001", "3002", "3003", "3004", "3005", "3301", "3302", "3303", "3309", "3310"
        ],
        "Amulets": [
            "str", "agi", "int",
            "vit", "spr", "mnd",
            "pp", "pm", "hp", 
            "sd", "spd", "rec", 
            "dp", "dm", "lch",
            "rfl", "crt", "skl"
        ],
        "Cards": [
            "3000", "3001", "3002", "3003", "3004", "3005", "3006", "3007", "3008", "3009", "3010", "3011",
            "3901", "3902", "3903", "3904", "3905", "3906", "3907", "3908"
        ],
        "Auras": [
            ["101", "102", "103", "104", "105"],
            ["201", "202", "203", "204", "205", "206", "207"],
            ["301", "302", "303", "304", "305", "306", "307", "308", "309"],
            ["401", "402", "403", "404", "405", "406", "407", "408"]
        ],
        "Gems": [
            "1", "2", "3", "4", "5", "6"
        ],
        "Sort": ["SortID", "SortKB", "SortKL", "SortPB", "SortPL", "SortMB", "SortML"]
    },
    "wish": {
        "Order": [
            [],
            ["ph", "ps"],
            ["a1", "a2", "a3"],
            ["pp", "pm", "hp", "sd"],
            ["sp", "ap", "am", "dp", "dm"]
        ]
    },
    "gift": {
        "Order": [
            ["1", "2"],
            ["3", "4"],
            ["5", "6"],
            ["7", "8"],
            ["9", "10"],
            ["11", "12"],
        ]
    }
}