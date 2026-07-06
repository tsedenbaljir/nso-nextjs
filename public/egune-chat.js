// Change domain here!
var domain = "nso";

var EGUNE_Z_INDEX = 2147483000;

var isOpen = false;
var responsiveType = false;

var chatBoxDesktopStyle = `
  z-index: ${EGUNE_Z_INDEX};
  overflow: hidden;
  visibility: hidden;
  border-radius: 30px;
  position: fixed;
  box-shadow: 0px 16px 32px 0px rgba(2, 2, 2, 0.1), 0px 1px 4px 0px rgba(29, 33, 45, 0.15), 0px 0px 1px 0px rgba(29, 33, 45, 0.20);
  box-sizing: border-box;
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out, transform 0.3s ease-in-out;
  transform-origin: bottom right;
  max-width: 860px;
  width: 100%;
  height: 80%;
  right: 40px;
  bottom: 110px;
  opacity: 0;
  pointer-events: none;
  transform: scale(0.3);`;

var chatBoxHiddenStyle = `
  z-index: ${EGUNE_Z_INDEX};
  position: fixed;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  border: none;
  box-shadow: none;
  transform: none;`;

var chatBtnSize = 60;

var chatBtnStyle = `
  z-index: ${EGUNE_Z_INDEX + 1};
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
  line-height: 0;`;

var full_screen_style = `
  z-index: ${EGUNE_Z_INDEX};
  position: fixed;
  inset: 0;
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
    if (isMobileView()) {
        return full_screen_style;
    }
    return chatBoxDesktopStyle + "opacity: 1; visibility: visible; pointer-events: auto; transform: scale(1);";
}

function applyChatBoxStyle(chatBoxEl, open) {
    chatBoxEl.style.cssText = open ? getOpenChatStyle() : getClosedChatStyle();
}

function mountChatOnTop() {
    const root = document.getElementById("egune-chat-root");
    if (root && document.body && root.parentNode === document.body) {
        document.body.appendChild(root);
    }
}

function bindMobileViewport(chatBoxEl) {
    if (!window.visualViewport || chatBoxEl.dataset.viewportBound === "true") {
        return;
    }

    chatBoxEl.dataset.viewportBound = "true";

    const syncHeight = () => {
        if (!isOpen || !isMobileView()) {
            return;
        }
        chatBoxEl.style.height = window.visualViewport.height + "px";
        chatBoxEl.style.top = window.visualViewport.offsetTop + "px";
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
    closeBtn.addEventListener("click", buttonClick);
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
    buttonElement.addEventListener("click", buttonClick);
    buttonElement.style.cssText = chatBtnStyle;
    chatbotElement.appendChild(buttonElement);

    document.body.appendChild(chatbotElement);
    mountChatOnTop();

    const floatingBtnStyle = document.createElement("style");
    floatingBtnStyle.textContent = `
      #egune-chat-root {
        position: static;
        z-index: ${EGUNE_Z_INDEX};
      }
      #egune-chat-root .floating-btn {
        appearance: none;
        -webkit-appearance: none;
        box-shadow: 0 4px 12px rgba(29, 33, 45, 0.18);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        transform: scale(1);
      }
      @media (hover: hover) and (pointer: fine) {
        #egune-chat-root .floating-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 18px rgba(29, 33, 45, 0.28);
        }
      }
      #egune-chat-root .egune-chat-box iframe {
        border: none;
        margin: 0;
        padding: 0;
        display: block;
        width: 100%;
        height: 100%;
        touch-action: auto;
      }
      #egune-chat-close-btn {
        display: none;
        position: absolute;
        top: max(12px, env(safe-area-inset-top, 12px));
        right: max(12px, env(safe-area-inset-right, 12px));
        z-index: ${EGUNE_Z_INDEX + 2};
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 50%;
        background: #89c9f6;
        color: #fff;
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        touch-action: manipulation;
      }
      @media (max-width: 860px) {
        .egune-greeting-box {
          right: max(16px, env(safe-area-inset-right, 16px)) !important;
          bottom: calc(${chatBtnSize}px + max(16px, env(safe-area-inset-bottom, 16px)) + 12px) !important;
          max-width: min(230px, calc(100vw - 32px)) !important;
        }
        #egune-chat-root .egune-chat-box.is-open #egune-chat-close-btn {
          display: block;
        }
        #egune-chat-root .egune-chat-box.is-open {
          transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out !important;
        }
      }
    `;
    document.head.appendChild(floatingBtnStyle);
}

function scheduleInit() {
    const run = () => {
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
    const createElement = (tag, className, attributes = {}) => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        Object.entries(attributes).forEach(([key, value]) => (el[key] = value));
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
    const greetingMessage = createElement("span", "egune-greeting-message", { textContent: "Би статистик мэдээллийн хиймэл оюунт чатбот байна. " });
    closeButton.addEventListener("click", () => {
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
          z-index: ${EGUNE_Z_INDEX + 1};
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
        }
        .egune-greeting-title {
          color: #353841;
          font-family: Inter, sans-serif;
          font-size: 14px;
          font-weight: 700;
          line-height: 24px;
          letter-spacing: -0.09px;
        }
        .egune-greeting-desc {
          color: #22242A;
          font-family: Inter, sans-serif;
          font-size: 14px;
          line-height: 24px;
          letter-spacing: -0.09px;
        }
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
    chatBoxEl.innerHTML = `
    <iframe
      allow="microphone *; clipboard-write *; fullscreen *"
      id="chimegeChatBotId"
      title="NSO chatbot"
      src="https://statgpt.nso.mn/widget"
    ></iframe>`;
    responsiveType = isMobileView() ? "full_screen" : "large";
    createMobileCloseButton(chatBoxEl);
    applyChatBoxStyle(chatBoxEl, false);
}

function buttonClick() {
    const greetingBox = document.getElementById("egune-greeting-box");
    const floatingBtn = document.getElementsByClassName("floating-btn")[0];
    const chatBoxEl = document.getElementsByClassName("egune-chat-box")[0];

    if (!chatBoxEl || !floatingBtn) {
        return;
    }

    mountChatOnTop();

    if (greetingBox) {
        greetingBox.style.display = "none";
    }

    if (!isOpen) {
        initChat();
    }

    isOpen = !isOpen;
    applyChatBoxStyle(chatBoxEl, isOpen);
    chatBoxEl.classList.toggle("is-open", isOpen);

    if (isMobileView()) {
        floatingBtn.style.display = isOpen ? "none" : "flex";
        bindMobileViewport(chatBoxEl);
    }
}

window.addEventListener("message", handleMessage, false);

function handleMessage(event) {
    if (event.data == "close_iframe") {
        buttonClick();
    }
}
