
# **Introduction** #
This project was inspired by the __咕咕镇__ and the __咕咕镇计算器__.

# **Details** #
There are some major difference comparing with the original game and `newkf.cpp` written by __brutelor@kf__ (which was succeed by __mi023@kf__, __zyxboy@kf__ and [__ilusrdbb@kf__](https://github.com/ilusrdbb/guguzhen-loganalysis)):
 * Health / Shield locks are handled right before damage applied; this prevents cases that recover is always greater than damage.
   * It is unknown that how the health or shield locks implemented in the original game, though.
 * Timing system is slightly different for the team battle / rumble mode.
   * Covers the original 1v1 case.
   * Ensure that least one fighter takes action every turn.
   * See `engine/emu.js` for details.
 * Implement power / damage / recover stack system for the team battle / rumble mode.
   * Covers the original 1v1 case.
   * Power (displayed on UI) / Damage / Recover increases slightly via stacking, but reduces by number of allies.
   * See `engine/emu.json.js` and `engine/emu.js` for details.
 * Known bugs of the original game would __NOT__ being implemented.
   * Critial / Skill trigger rate is incorrect.
   * Damage reduction would be applied twice when shield is not zero.

# **Running** #

## **Downloading Assets** ##

You may download my image assets from [my another project](https://github.com/hirakanaKF/fygpac).

The assets should be placed next to the root folder of this project.

## **Runing inside the Browser** #

Simply open `client/index.html` in your browser.

This project is written in pure common js and therefore it should be compatible with the browsers without any convertion.

## **Running with a Local Server** #

While this project is fully compatible with browsers for local play, it is also possible to play with an actual server.

1. Install the [MongoDB server](https://www.mongodb.com/try/download/community).
    * Optionally, you may install [MongoDB Compass](https://www.mongodb.com/try/download/shell) in case you would like to manage the database via GUI.
2. Download [Node.js](https://nodejs.org/en).
    * This server has been tested on `19.x` and `21.x`, the older or newer version should work as well.
3. Install the dependencies in `package.json`.
    * You may install via any package manager, for example `npm install`.
4. Generate certificate to `server/ssl/.crt` and key `server/ssl/.key`.
    * In case you don't have a certificate, you may use self-signed certificate with tools like openssl.
    * For example, using openssl running `openssl req -x509 -newkey rsa:4096 -keyout .key -out .crt -sha256 -days 3650 -nodes -subj "/C=XX/ST=StateName/L=CityName/O=CompanyName/OU=CompanySectionName/CN=CommonNameOrHostname"` should gives you a `.crt` signed with `.key`.
5. Open up `client/config/usr.json.js`, set `Online` to `1` and `Page` to `login`.
    * You may change `Host` and `Data` to wherever your server located.
6. Start the MongoDB server.
    * You may make a directory called `db` and run `mongod --dbpath ./db`.
    * Please note that you could change the path to anywhere you would like.
7. Start the Game server via `node server/index.js`. 
    * If you are using self-signed certificates, you may have to import it to your browser manually before you start playing, depends on which browser you are using.
    * Alternatively, you may to visit to `https://127.0.0.1:3000`, `https://127.0.0.1:3001`, `https://127.0.0.1:3002` in your browser and check accept risk on the warning page.

If everything goes well, your game server should be run at `127.0.0.1`.

Open `client/index.html` in your browser and you would be able to signup an account for playing.

# **Troubleshooting** #

In case you find some potential bugs, please feel free to [open new issues in this repo](https://github.com/hirakanaKF/fygemu/issues/new).

# **Credits** #

This project, __fygemu__, is currently being developed and maintained by __hirakanaKF__ (a.k.a. __hirakana@kf__).

In no particular order, we credit the following for their invaluable contributions:
 * __admin@kf__ and __xiny@kf__ for the original __咕咕镇__ project.
 * __brutelor@kf__ for the __咕咕镇计算器__.
 * __[HazukiKaguya (mistakey@kf)](https://github.com/HazukiKaguya)__ for the __[GuguTown_ThemePack](https://github.com/HazukiKaguya/GuguTown_ThemePack)__.
 * __[咕咕镇Wiki组](https://github.com/GuguTown)__ for the __[咕咕镇Wiki](https://github.com/GuguTown/Wiki)__.
 * __brutelor@kf__, __mi023@kf__, [__キズナヒトツ@kf__](https://github.com/kizunahitotsu), __bijiazu@kf__, [__ilusrdbb@kf__](https://github.com/ilusrdbb/) for their dedicated research on the original game.
 * __klarkzby@kf__, and various anonymous users for details about the dice war.
 * __The [MongoDB team](https://github.com/mongodb)__ and __[WebSockets team](https://github.com/websockets)__, as dependencies of the game server.
 * __Developers of the [ZUI](https://github.com/easysoft/zui) library__, an dependency of the original __咕咕镇__ project.
 * ... And __you__ for viewing or using this project.
