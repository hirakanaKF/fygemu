/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {
    const 
        elBody = document.createElement("div"),
        elId = document.createElement("div"),
        elIdLeft = document.createElement("span"),
        elIdRight = document.createElement("input"),
        elPwd = document.createElement("div"),
        elPwdLeft = document.createElement("span"),
        elPwdRight = document.createElement("input"),
        elPwdView = document.createElement("i"),
        elLogin = document.createElement("button"),
        elLoginName = document.createElement("span"),
        elLoginDesc = document.createTextNode(""),
        elSignup = document.createElement("button"),
        elSignupName = document.createElement("span"),
        elSignupDesc = document.createTextNode("")
    ;

    elBody.classList = "fyg_login"; elBody.append(elId, elPwd, elSignup, elLogin);
    elId.classList = "row fyg_nw"; elId.append(elIdLeft, elIdRight);
    elIdLeft.classList = "col-xs-4 col-md-1"; 
    elIdRight.classList = "col-xs-8 col-md-11";
    elPwd.classList = "row fyg_nw"; elPwd.append(elPwdLeft, elPwdRight, elPwdView);
    elPwdLeft.classList = "col-xs-4 col-md-1";
    elPwdRight.classList = "col-xs-8 col-md-11"; elPwdRight.type = "password";
    elLogin.type = elSignup.type = "button";
    elLogin.classList = elSignup.classList = "btn col-xs-6 fyg_lh30";
    elLogin.append(elLoginName, document.createElement("br"), elLoginDesc);
    elSignup.append(elSignupName, document.createElement("br"), elSignupDesc);
    elLoginName.classList = elSignupName.classList = "fyg_f18";
    elLogin.onclick = () => elLogin.blur() || Server[$SoIdIn](elIdRight.value, elPwdRight.value);
    elSignup.onclick = () => elSignup.blur() || Server[$SoIdUp](elIdRight.value, elPwdRight.value);
    elPwdView.classList = "icon icon-eye-close";
    elPwdView.style="display: inline-block; transform: translate(-150%, 25%);";
    elPwdView.onclick = () => {
        const cl = elPwdView.classList;
        if (cl.contains("icon-eye-close")) { elPwdRight.type = "text"; cl.remove("icon-eye-close"); cl.add("icon-eye-open"); return; }
        elPwdRight.type = "password"; cl.remove("icon-eye-open"); cl.add("icon-eye-close");
    };

    elBody.onload = () => {
        elIdLeft.innerHTML = gMsgData[$MsgNameId];
        elPwdLeft.innerHTML = gMsgData[$MsgNamePw];
        elLoginName.innerHTML = gMsgData[$MsgNameLogin];
        elLoginDesc.textContent = gMsgData[$MsgDescLogin];
        elSignupName.innerHTML = gMsgData[$MsgNameSignup];
        elSignupDesc.textContent = gMsgData[$MsgDescSignup];
    };

    eSvcRoot.append(elBody);
    
})();
