/*
Project: fygemu
Authors: hirakana@kf
*/

// Setup
(globalThis.window ? (window.Driver ??= {}) : exports).constructor = function (Data, Num) {

    const data = {};

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    this.__proto__ = {
        load: (emu, sys) => {
            data[Num.$NetDataDate] = Date.now();
            
            if (emu) {
                const bst = {}, actor = emu.Actors ?? {};
                data[Num.$NetActorBst] = bst;
                data[Num.$NetActorPst] = emu.ActorStats ?? {};
                data[Num.$NetEquipPst] = emu.EquipStats ?? {};
                for (const k in actor) {
                    bst[k] = actor.stats ?? {};
                }
            }

            if (sys) {
                data[Num.$NetItemMax] = sys.num;
                data[Num.$NetRankMax] = sys.rank;
                data[Num.$NetTrailMin] = sys.trail;
                data[Num.$NetDrugCost] = sys.drug.Cost;
                data[Num.$NetEquipLimit] = sys.ecLmt;
                data[Num.$NetFruitLimit] = sys.fcLmt;
                data[Num.$NetCraftItems] = sys.ecGen.map(d => d.Cost);
                data[Num.$NetSpawnItems] = sys.acSpw.map(d => d.Cost);
                data[Num.$NetAmassItems] = sys.gcMine.map(d => d.Cost);
                data[Num.$NetActorExp] = sys.acExp;
                data[Num.$NetActorElt] = sys.acElt;
                data[Num.$NetEquipForgeCost] = sys.ecFrg.Cost;
                data[Num.$NetEquipForgeMul] = sys.ecFrg.Mul;
                data[Num.$NetEquipForgeCap] = sys.ecFrg.Cap;
                data[Num.$NetFruitForgeCost] = sys.fcFrg.Cost;
                data[Num.$NetFruitForgeMul] = sys.fcFrg.Mul;
                data[Num.$NetFruitForgeCap] = sys.fcFrg.Cap;
                data[Num.$NetAuraCost] = sys.aura;
                data[Num.$NetWishLimit] = sys.wpDrop.Kind;
                data[Num.$NetWishDaily] = sys.wpDrop.Cap;
                data[Num.$NetWishCost] = sys.wpDrop.Cost;
                data[Num.$NetGiftCost] = sys.gift.Cost;
                data[Num.$NetShopItem] = sys.scItem;
                data[Num.$NetShopBack] = sys.scBack;
            }

            return JSON.stringify(data);
        }
    }
}
