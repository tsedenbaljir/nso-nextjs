// Change domain here!
var domain = "nso";

var EGUNE_Z_INDEX = 2147483000;
var STATGPT_WIDGET_URL = "https://statgpt.nso.mn/widget";

var isOpen = false;
var responsiveType = false;
var chatBtnSize = 60;

var chatBoxDesktopStyle = `
  z-index: ${EGUNE_Z_INDEX + 5};
  overflow: hidden;
  border-radius: 30px;
  position: fixed;
  box-shadow: 0px 16px 32px 0px rgba(2, 2, 2, 0.1), 0px 1px 4px 0px rgba(29, 33, 45, 0.15), 0px 0px 1px 0px rgba(29, 33, 45, 0.20);
  box-sizing: border-box;
  transition: opacity 0.25s ease-in-out, visibility 0.25s ease-in-out;
  max-width: 860px;
  width: min(100%, 860px);
  height: 80%;
  right: 40px;
  bottom: 110px;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: none;`;

var chatBoxHiddenStyle = `
  z-index: ${EGUNE_Z_INDEX};
  position: fixed;
  left: 0;
  top: 0;
  width: 0 !important;
  height: 0 !important;
  max-width: 0 !important;
  max-height: 0 !important;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  pointer-events: none !important;
  border: none;
  box-shadow: none;
  transform: none;
  inset: auto;`;

var chatBtnStyle = `
  z-index: ${EGUNE_Z_INDEX + 2};
  width: ${chatBtnSize}px;
  height: ${chatBtnSize}px;
  min-width: ${chatBtnSize}px;
  min-height: ${chatBtnSize}px;
  padding: 0;
  overflow: hidden;
  border-radius: 50%;
  background: #2b6cb8 url('/NSO-chatbot-02.png') center center / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  right: max(16px, env(safe-area-inset-right, 16px));
  bottom: max(16px, env(safe-area-inset-bottom, 16px));
  border: none;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  pointer-events: auto;
  line-height: 0;`;

var full_screen_style = `
  z-index: ${EGUNE_Z_INDEX + 5};
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  height: 100dvh;
  max-width: none;
  border-radius: 0;
  box-sizing: border-box;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
  box-shadow: none;
  opacity: 1;
  pointer-events: auto;
  transform: none;
  visibility: visible;`;

function isMobileView() {
    return window.matchMedia("(max-width: 860px)").matches;
}

function setCookie(name, value) {
    document.cookie = name + "=" + (value || "") + "; path=/";
}

function getClosedChatStyle() {
    return chatBoxHiddenStyle;
}

function getOpenChatStyle() {
    return isMobileView() ? full_screen_style : chatBoxDesktopStyle;
}

function applyChatBoxStyle(chatBoxEl, open) {
    chatBoxEl.style.cssText = open ? getOpenChatStyle() : getClosedChatStyle();
}

function setChatActiveState(active) {
    const root = document.getElementById("egune-chat-root");
    const greetingBox = document.getElementById("egune-greeting-box");
    const floatingBtn = document.querySelector("#egune-chat-root .floating-btn");
    const chatBoxEl = document.querySelector("#egune-chat-root .egune-chat-box");

    if (root) {
        root.classList.toggle("chat-active", active);
    }

    if (greetingBox) {
        greetingBox.style.display = active ? "none" : "";
        greetingBox.style.pointerEvents = active ? "none" : "auto";
    }

    if (floatingBtn) {
        floatingBtn.style.display = active ? "none" : "flex";
        floatingBtn.style.pointerEvents = active ? "none" : "auto";
    }

    if (chatBoxEl) {
        chatBoxEl.classList.toggle("is-open", active);
        chatBoxEl.style.pointerEvents = active ? "auto" : "none";
    }
}

function mountChatOnTop() {
    const root = document.getElementById("egune-chat-root");
    if (root && document.body && root.parentNode === document.body) {
        document.body.appendChild(root);
    }
}

function watchChatMount() {
    if (window.__eguneChatMountObserver || !document.body) {
        return;
    }

    window.__eguneChatMountObserver = new MutationObserver(function () {
        mountChatOnTop();
    });
    window.__eguneChatMountObserver.observe(document.body, { childList: true });
}

function bindMobileViewport(chatBoxEl) {
    if (!window.visualViewport || chatBoxEl.dataset.viewportBound === "true") {
        return;
    }

    chatBoxEl.dataset.viewportBound = "true";

    const syncHeight = function () {
        if (!isOpen || !isMobileView()) {
            return;
        }
        chatBoxEl.style.height = window.visualViewport.height + "px";
        chatBoxEl.style.top = window.visualViewport.offsetTop + "px";
        chatBoxEl.style.left = "0";
        chatBoxEl.style.right = "0";
        chatBoxEl.style.bottom = "auto";
        chatBoxEl.style.width = "100%";
    };

    window.visualViewport.addEventListener("resize", syncHeight);
    window.visualViewport.addEventListener("scroll", syncHeight);
    syncHeight();
}

function createMobileCloseButton(chatBoxEl) {
    if (document.getElementById("egune-chat-close-btn")) {
        return;
    }

    const closeBtn = document.createElement("button");
    closeBtn.id = "egune-chat-close-btn";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close chat");
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        buttonClick();
    });
    chatBoxEl.appendChild(closeBtn);
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

    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap";
    document.head.appendChild(fontLink);

    setCookie("currentDomain", domain);

    const chatbotElement = document.createElement("div");
    chatbotElement.className = "egune-chat";
    chatbotElement.id = "egune-chat-root";

    const chatBoxElement = document.createElement("div");
    chatBoxElement.className = "egune-chat-box";
    chatBoxElement.style.cssText = getClosedChatStyle();
    chatbotElement.appendChild(chatBoxElement);

    const greetingBox = greetingBoxCreater();
    chatbotElement.appendChild(greetingBox);

    const buttonElement = document.createElement("button");
    buttonElement.className = "floating-btn";
    buttonElement.setAttribute("type", "button");
    buttonElement.setAttribute("aria-label", "NSO chatbot");
    buttonElement.addEventListener("click", function (event) {
        event.preventDefault();
        buttonClick();
    });
    buttonElement.style.cssText = chatBtnStyle;
    chatbotElement.appendChild(buttonElement);

    document.body.appendChild(chatbotElement);
    mountChatOnTop();
    watchChatMount();

    const floatingBtnStyle = document.createElement("style");
    floatingBtnStyle.textContent = `
      #egune-chat-root {
        position: fixed;
        inset: 0;
        width: 0;
        height: 0;
        overflow: visible;
        z-index: ${EGUNE_Z_INDEX};
        pointer-events: none;
      }
      #egune-chat-root.chat-active {
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      #egune-chat-root .floating-btn {
        appearance: none;
        -webkit-appearance: none;
        box-shadow: 0 4px 12px rgba(29, 33, 45, 0.18);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        transform: scale(1);
        pointer-events: auto !important;
      }
      @media (hover: hover) and (pointer: fine) {
        #egune-chat-root .floating-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 18px rgba(29, 33, 45, 0.28);
        }
      }
      #egune-chat-root .egune-chat-box {
        pointer-events: none;
      }
      #egune-chat-root.chat-active .egune-chat-box.is-open {
        pointer-events: auto !important;
      }
      #egune-chat-root .egune-chat-box iframe {
        border: none;
        margin: 0;
        padding: 0;
        display: block;
        width: 100%;
        height: 100%;
        touch-action: auto;
        background: #fff;
        position: relative;
        z-index: 1;
        pointer-events: auto;
      }
      #egune-chat-close-btn {
        display: none;
        position: absolute;
        top: max(12px, env(safe-area-inset-top, 12px));
        right: max(12px, env(safe-area-inset-right, 12px));
        z-index: 10;
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        background: #89c9f6;
        color: #fff;
        font-size: 22px;
        line-height: 1;
        cursor: pointer;
        touch-action: manipulation;
        pointer-events: auto !important;
      }
      #egune-chat-root.chat-active .egune-chat-box.is-open #egune-chat-close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #egune-chat-root.chat-active .floating-btn,
      #egune-chat-root.chat-active .egune-greeting-box {
        display: none !important;
        pointer-events: none !important;
      }
      @media (max-width: 860px) {
        .egune-greeting-box {
          right: max(16px, env(safe-area-inset-right, 16px)) !important;
          bottom: calc(${chatBtnSize}px + max(16px, env(safe-area-inset-bottom, 16px)) + 12px) !important;
          max-width: min(230px, calc(100vw - 32px)) !important;
        }
      }
    `;
    document.head.appendChild(floatingBtnStyle);
}

function scheduleInit() {
    const run = function () {
        initEguneChat();
        mountChatOnTop();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }

    window.addEventListener("load", mountChatOnTop);
}

scheduleInit();

function greetingBoxCreater() {
    const createElement = function (tag, className, attributes) {
        attributes = attributes || {};
        const el = document.createElement(tag);
        if (className) el.className = className;
        Object.entries(attributes).forEach(function (entry) {
            el[entry[0]] = entry[1];
        });
        return el;
    };

    const greetingBox = createElement("div", "egune-greeting-box", { id: "egune-greeting-box" });
    const header = createElement("div", "egune-bot-header");
    const emoji = createElement("span", "egune-greeting-emoji", { textContent: "👋  " });
    const title = createElement("span", "egune-greeting-title", { textContent: "Сайн байна уу." });
    const closeButton = createElement("button", "close-button", {
        type: "button",
        innerHTML: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M3.52925 3.52851C3.7896 3.26816 4.21171 3.26816 4.47206 3.52851L8.00065 7.05711L11.5292 3.52851C11.7896 3.26816 12.2117 3.26816 12.4721 3.52851C12.7324 3.78886 12.7324 4.21097 12.4721 4.47132L8.94346 7.99992L12.4721 11.5285C12.7324 11.7889 12.7324 12.211 12.4721 12.4713C12.2117 12.7317 11.7896 12.7317 11.5292 12.4713L8.00065 8.94273L4.47206 12.4713C4.21171 12.7317 3.7896 12.7317 3.52925 12.4713C3.2689 12.211 3.2689 11.7889 3.52925 11.5285L7.05784 7.99992L3.52925 4.47132C3.2689 4.21097 3.2689 3.78886 3.52925 3.52851Z" fill="#4C505D"/>
        </svg>
    `,
    });
    const description = createElement("span", "egune-greeting-desc", { textContent: "Танд юугаар туслах вэ?" });
    const greetingMessage = createElement("span", "egune-greeting-message", {
        textContent: "Би статистик мэдээллийн хиймэл оюунт чатбот байна. ",
    });
    closeButton.addEventListener("click", function () {
        greetingBox.style.display = "none";
    });
    header.append(emoji, title, closeButton);
    greetingBox.append(header, greetingMessage, description);

    const style = document.createElement("style");
    style.textContent = `
        .egune-greeting-box {
          background-color: white;
          border-radius: 12px;
          width: 100%;
          max-width: 230px;
          height: fit-content;
          padding: 10px 16px 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: fixed;
          right: 30px;
          bottom: 90px;
          box-sizing: border-box;
          box-shadow: 0px 4px 30px 0px rgba(0, 0, 0, 0.16);
          z-index: ${EGUNE_Z_INDEX + 2};
          pointer-events: auto;
        }
        .egune-greeting-box .egune-bot-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .egune-greeting-box .egune-bot-header .close-button {
          display: flex;
          align-items: center;
          margin-left: auto;
          background-color: transparent;
          border: none;
          cursor: pointer;
          touch-action: manipulation;
          pointer-events: auto;
        }
        .egune-greeting-title {
          color: #353841;
          font-family: Inter, sans-serif;
          font-size: 14px;
          font-weight: 700;
          line-height: 24px;
          letter-spacing: -0.09px;
        }
        .egune-greeting-desc,
        .egune-greeting-message {
          color: #22242A;
          font-family: Inter, sans-serif;
          font-size: 14px;
          line-height: 20px;
          letter-spacing: -0.09px;
        }
    `;
    document.head.appendChild(style);

    return greetingBox;
}

function initChat() {
    const chatBoxEl = document.getElementsByClassName("egune-chat-box")[0];
    if (!chatBoxEl) return;

    if (!document.getElementById("chimegeChatBotId")) {
        chatBoxEl.innerHTML = `
          <iframe
            allow="microphone *; clipboard-write *; fullscreen *"
            id="chimegeChatBotId"
            title="NSO chatbot"
            src="${STATGPT_WIDGET_URL}"
          ></iframe>`;
        createMobileCloseButton(chatBoxEl);
    }

    responsiveType = isMobileView() ? "full_screen" : "large";
    applyChatBoxStyle(chatBoxEl, false);
}

function buttonClick() {
    const chatBoxEl = document.getElementsByClassName("egune-chat-box")[0];
    const floatingBtn = document.getElementsByClassName("floating-btn")[0];

    if (!chatBoxEl || !floatingBtn) {
        return;
    }

    mountChatOnTop();

    if (!isOpen) {
        initChat();
    }

    isOpen = !isOpen;
    applyChatBoxStyle(chatBoxEl, isOpen);
    setChatActiveState(isOpen);

    if (isOpen && isMobileView()) {
        bindMobileViewport(chatBoxEl);
    }
}

window.addEventListener("message", handleMessage, false);

function handleMessage(event) {
    if (event.data == "close_iframe") {
        if (isOpen) {
            buttonClick();
        }
    }
}
