// Change domain here!
var domain = "nso";

var EGUNE_Z_INDEX = 10050;
var STATGPT_WIDGET_URL = "https://statgpt.nso.mn/widget";

var isOpen = false;
var chatBtnSize = 60;

function isMobileView() {
    return window.matchMedia("(max-width: 860px)").matches;
}

function setCookie(name, value) {
    document.cookie = name + "=" + (value || "") + "; path=/";
}

function hideGreeting() {
    var greetingBox = document.getElementById("egune-greeting-box");
    if (greetingBox) {
        greetingBox.style.display = "none";
    }
}

function setFloatingBtnVisible(visible) {
    var floatingBtn = document.querySelector("#egune-chat-root .floating-btn");
    if (floatingBtn) {
        floatingBtn.style.display = visible ? "flex" : "none";
    }
}

function lockPageScroll(lock) {
    document.documentElement.classList.toggle("egune-chat-open", lock);
    document.body.classList.toggle("egune-chat-open", lock);
}

function createCloseButton(id, onClose) {
    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.id = id;
    closeBtn.className = "egune-chat-close-btn";
    closeBtn.setAttribute("aria-label", "Close chat");
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
    });
    return closeBtn;
}

function createChatIframe() {
    var iframe = document.createElement("iframe");
    iframe.id = "chimegeChatBotId";
    iframe.className = "egune-chat-iframe";
    iframe.title = "NSO chatbot";
    iframe.src = STATGPT_WIDGET_URL;
    iframe.allow = "microphone; clipboard-write; fullscreen";
    iframe.setAttribute("allowfullscreen", "true");
    return iframe;
}

function openMobileChat() {
    hideGreeting();
    setFloatingBtnVisible(false);
    lockPageScroll(true);

    var portal = document.getElementById("egune-mobile-portal");
    if (!portal) {
        portal = document.createElement("div");
        portal.id = "egune-mobile-portal";

        var header = document.createElement("div");
        header.className = "egune-mobile-header";
        header.appendChild(
            createCloseButton("egune-mobile-close", closeMobileChat)
        );

        var frameWrap = document.createElement("div");
        frameWrap.className = "egune-mobile-frame-wrap";
        frameWrap.appendChild(createChatIframe());

        portal.appendChild(header);
        portal.appendChild(frameWrap);
        document.body.appendChild(portal);
    }

    portal.classList.add("is-open");
    isOpen = true;
}

function closeMobileChat() {
    var portal = document.getElementById("egune-mobile-portal");
    if (portal) {
        portal.classList.remove("is-open");
    }
    lockPageScroll(false);
    setFloatingBtnVisible(true);
    isOpen = false;
}

function openDesktopChat() {
    var chatBoxEl = document.querySelector("#egune-chat-root .egune-chat-box");
    var root = document.getElementById("egune-chat-root");
    if (!chatBoxEl) {
        return;
    }

    hideGreeting();

    if (!document.getElementById("chimegeChatBotId")) {
        chatBoxEl.innerHTML = "";

        var closeBtn = createCloseButton("egune-chat-close-btn", closeDesktopChat);
        closeBtn.className = "egune-chat-close-btn egune-desktop-close";

        var frameWrap = document.createElement("div");
        frameWrap.className = "egune-chat-frame-wrap";
        frameWrap.appendChild(createChatIframe());

        chatBoxEl.appendChild(closeBtn);
        chatBoxEl.appendChild(frameWrap);
    }

    chatBoxEl.classList.add("is-open");
    if (root) {
        root.classList.add("desktop-chat-open");
    }
    isOpen = true;
}

function closeDesktopChat() {
    var chatBoxEl = document.querySelector("#egune-chat-root .egune-chat-box");
    var root = document.getElementById("egune-chat-root");
    if (chatBoxEl) {
        chatBoxEl.classList.remove("is-open");
    }
    if (root) {
        root.classList.remove("desktop-chat-open");
    }
    isOpen = false;
}

function buttonClick() {
    if (isMobileView()) {
        if (isOpen) {
            closeMobileChat();
        } else {
            openMobileChat();
        }
        return;
    }

    if (isOpen) {
        closeDesktopChat();
    } else {
        openDesktopChat();
    }
}

function mountChatOnTop() {
    var root = document.getElementById("egune-chat-root");
    var portal = document.getElementById("egune-mobile-portal");
    if (!document.body) {
        return;
    }
    if (root && root.parentNode === document.body && document.body.lastElementChild !== root) {
        document.body.appendChild(root);
    }
    if (portal && portal.parentNode === document.body) {
        document.body.appendChild(portal);
    }
}

function initEguneChat() {
    if (window.__eguneChatInitialized) {
        mountChatOnTop();
        return;
    }

    if (!document.body) {
        return;
    }

    window.__eguneChatInitialized = true;
    setCookie("currentDomain", domain);

    var chatbotElement = document.createElement("div");
    chatbotElement.id = "egune-chat-root";

    var chatBoxElement = document.createElement("div");
    chatBoxElement.className = "egune-chat-box";
    chatbotElement.appendChild(chatBoxElement);

    var greetingBox = greetingBoxCreater();
    chatbotElement.appendChild(greetingBox);

    var buttonElement = document.createElement("button");
    buttonElement.className = "floating-btn";
    buttonElement.type = "button";
    buttonElement.setAttribute("aria-label", "NSO chatbot");
    buttonElement.addEventListener("click", buttonClick);
    chatbotElement.appendChild(buttonElement);

    document.body.appendChild(chatbotElement);
    mountChatOnTop();

    var style = document.createElement("style");
    style.textContent =
        "#egune-chat-root{position:fixed;right:max(16px,env(safe-area-inset-right,16px));bottom:max(16px,env(safe-area-inset-bottom,16px));z-index:" +
        EGUNE_Z_INDEX +
        ";pointer-events:none}" +
        "#egune-chat-root .floating-btn{appearance:none;-webkit-appearance:none;position:relative;pointer-events:auto;width:" +
        chatBtnSize +
        "px;height:" +
        chatBtnSize +
        "px;min-width:" +
        chatBtnSize +
        "px;min-height:" +
        chatBtnSize +
        "px;padding:0;border:none;border-radius:50%;background:#2b6cb8 url('/NSO-chatbot-02.png') center center/cover no-repeat;box-shadow:0 4px 12px rgba(29,33,45,.18);cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;transition:box-shadow .2s ease}" +
        "@media(hover:hover)and(pointer:fine){#egune-chat-root .floating-btn:hover{box-shadow:0 6px 18px rgba(29,33,45,.28)}}" +
        "#egune-chat-root.desktop-chat-open .floating-btn{z-index:" +
        (EGUNE_Z_INDEX + 3) +
        ";box-shadow:0 6px 18px rgba(29,33,45,.28)}" +
        "#egune-chat-root .egune-chat-box{display:none;pointer-events:none}" +
        "#egune-chat-root .egune-chat-box.is-open{display:flex;flex-direction:column;pointer-events:auto;position:fixed;z-index:" +
        (EGUNE_Z_INDEX + 1) +
        ";right:max(40px,env(safe-area-inset-right,40px));bottom:calc(" +
        chatBtnSize +
        "px + max(16px,env(safe-area-inset-bottom,16px)) + 34px);width:min(calc(100vw - 32px),860px);height:min(80vh,calc(100dvh - " +
        chatBtnSize +
        "px - max(16px,env(safe-area-inset-bottom,16px)) - 50px));max-width:860px;border-radius:30px;overflow:hidden;box-shadow:0 16px 32px rgba(2,2,2,.1),0 1px 4px rgba(29,33,45,.15);background:#fff}" +
        "#egune-chat-root .egune-desktop-close{position:absolute;top:12px;right:12px;z-index:2}" +
        "#egune-chat-root .egune-chat-frame-wrap{flex:1;min-height:0;position:relative;height:100%}" +
        "#egune-chat-root .egune-chat-iframe,#egune-mobile-portal .egune-chat-iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;background:#fff}" +
        ".egune-chat-close-btn{width:26px;height:26px;border:none;border-radius:50%;background:#89c9f6;color:#fff;font-size:16px;line-height:1;cursor:pointer;touch-action:manipulation;flex-shrink:0}" +
        "#egune-mobile-portal{display:none;position:fixed;inset:0;width:100%;height:100dvh;z-index:" +
        (EGUNE_Z_INDEX + 2) +
        ";background:#fff;flex-direction:column}" +
        "#egune-mobile-portal.is-open{display:flex}" +
        "#egune-mobile-portal .egune-mobile-header{flex-shrink:0;display:flex;justify-content:flex-end;align-items:center;height:calc(25px + env(safe-area-inset-top,0px));padding:env(safe-area-inset-top,0px) max(12px,env(safe-area-inset-right,12px)) 0;background:#fff}" +
        "#egune-mobile-portal .egune-mobile-frame-wrap{flex:1;min-height:0;position:relative}" +
        "#egune-mobile-portal .egune-chat-close-btn{width:21px;height:21px;font-size:14px}" +
        "html.egune-chat-open,body.egune-chat-open{overflow:hidden!important}" +
        "#egune-chat-root .egune-greeting-box{position:absolute;right:0;bottom:calc(" +
        chatBtnSize +
        "px + 12px);max-width:min(230px,calc(100vw - 32px));background:#fff;border-radius:12px;padding:10px 16px 20px;box-shadow:0 4px 30px rgba(0,0,0,.16);pointer-events:auto;display:flex;flex-direction:column;gap:12px}" +
        "#egune-chat-root .egune-greeting-box .close-button{margin-left:auto;background:transparent;border:none;cursor:pointer;touch-action:manipulation}" +
        "#egune-chat-root .egune-greeting-title{font-family:Inter,sans-serif;font-size:14px;font-weight:700;color:#353841}" +
        "#egune-chat-root .egune-greeting-desc,#egune-chat-root .egune-greeting-message{width: 210px;font-family:Inter,sans-serif;font-size:14px;color:#22242a;line-height:20px}" +
        "#egune-chat-root .egune-bot-header{display:flex;align-items:center;gap:8px}";
    document.head.appendChild(style);
}

function greetingBoxCreater() {
    var greetingBox = document.createElement("div");
    greetingBox.className = "egune-greeting-box";
    greetingBox.id = "egune-greeting-box";

    var header = document.createElement("div");
    header.className = "egune-bot-header";

    var emoji = document.createElement("span");
    emoji.textContent = "👋  ";

    var title = document.createElement("span");
    title.className = "egune-greeting-title";
    title.textContent = "Сайн байна уу.";

    var closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "close-button";
    closeButton.innerHTML = "&times;";
    closeButton.addEventListener("click", function () {
        greetingBox.style.display = "none";
    });

    var message = document.createElement("span");
    message.className = "egune-greeting-message";
    message.textContent = "Би статистик мэдээллийн хиймэл оюунт чатбот байна.";

    var description = document.createElement("span");
    description.className = "egune-greeting-desc";
    description.textContent = "Танд юугаар туслах вэ?";

    header.appendChild(emoji);
    header.appendChild(title);
    header.appendChild(closeButton);
    greetingBox.appendChild(header);
    greetingBox.appendChild(message);
    greetingBox.appendChild(description);

    return greetingBox;
}

function scheduleInit() {
    var run = function () {
        initEguneChat();
        mountChatOnTop();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }

    window.addEventListener("load", mountChatOnTop);
    window.addEventListener("pageshow", mountChatOnTop);
}

scheduleInit();

window.addEventListener("message", function (event) {
    if (event.data == "close_iframe" && isOpen) {
        if (isMobileView()) {
            closeMobileChat();
        } else {
            closeDesktopChat();
        }
    }
});
