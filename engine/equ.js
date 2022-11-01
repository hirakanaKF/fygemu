/*
Project: fygemu
Authors: hirakana@kf
*/

// Setup
{
    
    const

        _ = {

            // Minimum positive number
            $EquNumMin: 1,

            // Maximum positive number
            $EquNumMax: Number.MAX_SAFE_INTEGER,

            // Number to Integer cast
            $EquNumCast: x => Math.floor(x),

            // Number to Integer round
            $EquEmuRound2: x => +x.toFixed(2),

            // Actor point formula
            $EquActorPoint: (m, a, l, q) => $EquNumCast((m * l + a) * (1 + 0.01 * q)),

            // Equipment level transform
            $EquEquipLevel: l => l,

            // Equipment attributes formula
            $EquEquipStats: (m, a, l, q) => $EquNumCast((m * l + a) * (q * 0.01) * 10) * 0.1,

            // Unit stats point transform
            $EquUnitPoint: n => n,

            // Unit stats by base and ratio
            $EquUnitStats: (n, r) => $EquNumCast(n * (1 + 0.01 * r)),

            // Unit health ratio formula
            $EquUnitHpMax: (n, r) => $EquNumCast(n * (1 + 0.01 * r)),

            // Unit health base heal formula
            $EquUnitHpHeal: (n, m, a) => $EquNumCast(n * (0.01 * m) + a),

            // Unit health final heal formula
            $EquUnitHpRec: (n, r) => $EquNumCast(n * (1 + r * 0.01)),

            // Unit shield ratio formula
            $EquUnitSdMax: (n, r) => $EquNumCast(n * (1 + 0.01 * r)),

            // Unit shield base heal formula
            $EquUnitSdHeal: (n, m, a) => $EquNumCast(n * (0.01 * m) + a),

            // Unit shield final heal formula
            $EquUnitSdRec: (n, r) => $EquNumCast(n * (1 + r * 0.01)),

            // Unit speed ratio formula
            $EquUnitSpd: (n, r) => $EquNumCast(n * (1 + 0.01 * r)),

            // Unit leech formula
            $EquUnitLch: (n, r, p) => $EquNumCast(n * r) * (0.01 * p),

            // Unit reflect formula
            $EquUnitRfl: (n, r) => $EquNumCast(n * r) * 0.01,

            // Unit scale formula
            $EquUnitScl: (n, r) => $EquNumCast(n * (1 + r * 0.01)),

            // Unit defense formula
            $EquUnitDef: (ar, af, br, bf) => $EquNumCast((
                $EquNumCast(bf * ((100 + (br - ar || 0)) * 0.01)) - af || 0
            ) * 0.1),

            // Level cap for equip generation
            $EquEcGenLv: (u, l) => Math.min(u.mGrade, l),

            // Level cap for fruit generation
            $EquFcGenLv: (u, l) => l,

            // 
            $EquSkillName: n => n >= 0 ? gMsgSkillName[("000000" + n.toString(16)).slice(-7)] ?? n : "",
            $EquSkillDesc: n => n >= 0 ? gMsgSkillDesc[("000000" + n.toString(16)).slice(-7)] ?? n : ""
        }
    ;

    if (globalThis.window) { Object.assign(globalThis, _); }
    else { module.exports = _; }
}