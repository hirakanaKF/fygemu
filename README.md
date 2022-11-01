
# Introduction #
This project was inspired by the __咕咕镇__ and the __咕咕镇计算器__.

Comparing with the original game and `newkf.cpp` by __brutelor@kf__:
 * Health / Shield locks (__DI__) are handled right before damage applied; this prevents cases that recover is always greater than damage.
   * It is unknown that how the health or shield locks work in the original game, though.
 * Timing system is slightly different for the rumble mode.
   * Covers the original 1v1 case.
   * Ensure that least one fighter takes action every turn.
   * See `render/pk.js` for details.
 * Implement power / damage / recover stack system for the rumble mode.
   * Covers the original 1v1 case.
   * Power (displayed on UI) / Damage / Recover increases slightly via stacking, but reduces by number of allies.
   * See `define/config.js` and `define/battle.js` for details.

In case you find some potential bugs or counter examples of current algorithms, please feel free to report issues in this repo.

# Credits #

This project, __fygemu__, is currently being developed and maintained by __hirakanaKF__ (a.k.a. __hirakana@kf__).

In no particular order, we credit the following for their invaluable contributions:
 * __admin@kf__ and __xiny@kf__ for the original __咕咕镇__ project.
 * __brutelor@kf__ for the __咕咕镇计算器__.
 * __[HazukiKaguya](https://github.com/HazukiKaguya)__ (a.k.a. __mistakey@kf__) for the __[GuguTown_ThemePack](https://github.com/HazukiKaguya/GuguTown_ThemePack)__.
 * __[咕咕镇Wiki组](https://github.com/GuguTown)__ for the __[咕咕镇Wiki](https://github.com/GuguTown/Wiki)__.
 * __Developers of the [ZUI](https://github.com/easysoft/zui) library__, an dependency of the original __咕咕镇__ project.
 * ... And __you__ for viewing or using this project.
