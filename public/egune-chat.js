// Change domain here!
var domain = "nso";

// Font importing
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap";
document.head.appendChild(fontLink);

var isOpen = false;
var responsiveType = false;

var chatBoxStyle = `
  z-index:10000; 
  overflow:auto;
  visibility:hidden;
  border-radius: 30px;
  position: fixed;
  box-shadow: 0px 16px 32px 0px rgba(29, 33, 45, 0.10), 0px 1px 4px 0px rgba(29, 33, 45, 0.15), 0px 0px 1px 0px rgba(29, 33, 45, 0.20);
  box-sizing: border-box;
  transition: all 0.3s ease-in-out;
  transform-origin: bottom right;
  max-width: 860px;
  width: 100%;
  height: 80%;
  right: 40px;
  bottom: 110px;
  transform: scale(0.3)`;

var chatBtnStyle = `
  z-index: 999;
  width: 56px;
  height: 56px;
  border-radius: 100px;
  font-size: 40px;
  box-shadow: 0px 2px 4px 0px rgba(29, 33, 45, 0.08), 0px 0px 2px 0px rgba(29, 33, 45, 0.08), 0px 0px 1px 0px rgba(29, 33, 45, 0.20);
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  right: 40px;
  bottom: 40px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  background: #87ceeb`;

var full_screen_style = `
  z-index: 10000; 
  position: fixed; 
  width: 100%; 
  max-width: unset; 
  height: 100%; 
  top: 0;
`;

setCookie("currentDomain", domain);

function setCookie(name, value) {
    var expires = "";
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

if (document.body != null) {
    const chatbotElement = document.createElement("div");
    chatbotElement.className = "egune-chat";

    const chatBoxElement = document.createElement("div");
    chatBoxElement.className = "egune-chat-box";
    chatBoxElement.style = chatBoxStyle + `transform: scale(0);`;
    chatbotElement.appendChild(chatBoxElement);

    let greetingBox = greetingBoxCreater();
    chatbotElement.appendChild(greetingBox);

    const buttonElement = document.createElement("button");
    buttonElement.className = "floating-btn";
    buttonElement.addEventListener("click", buttonClick);
    buttonElement.addEventListener("mouseover", mouseOver);
    buttonElement.addEventListener("mouseleave", mouseLeave);
    chatbotElement.appendChild(buttonElement);

    document.body.appendChild(chatbotElement);
} else {
    const rootElement = document.documentElement;
    const firstTier = rootElement.childNodes;
    firstTier[1].innerHTML = firstTier[0].innerHTML + `<div className="egune-chat" style="z-index: 999;position:fixed !important"><div className="egune-chat-box"></div><button className="floating-btn" onclick="buttonClick()"></button></div>`;
}

const floatingBtn = document.getElementsByClassName("floating-btn")[0];
var botIcon = document.createElement("img");
botIcon.setAttribute('src', 'https://statgpt.egune.com/images/chatbot.png');
botIcon.setAttribute('alt', 'na');
botIcon.setAttribute('height', '36px');
botIcon.setAttribute('width', '36px');
floatingBtn.appendChild(botIcon);
floatingBtn.style = chatBtnStyle;

function greetingBoxCreater() {
    const createElement = (tag, className, attributes = {}) => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        Object.entries(attributes).forEach(([key, value]) => (el[key] = value));
        return el;
    };

    const greetingBox = createElement("div", "egune-greeting-box", { id: "egune-greeting-box" });
    const header = createElement("div", "egune-bot-header");
    const emoji = createElement("span", "egune-greeting-emoji", { textContent: `👋  ` });
    const title = createElement("span", "egune-greeting-title", { textContent: `Сайн байна уу.` });
    const closeButton = createElement("button", "close-button", {
        innerHTML: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M3.52925 3.52851C3.7896 3.26816 4.21171 3.26816 4.47206 3.52851L8.00065 7.05711L11.5292 3.52851C11.7896 3.26816 12.2117 3.26816 12.4721 3.52851C12.7324 3.78886 12.7324 4.21097 12.4721 4.47132L8.94346 7.99992L12.4721 11.5285C12.7324 11.7889 12.7324 12.211 12.4721 12.4713C12.2117 12.7317 11.7896 12.7317 11.5292 12.4713L8.00065 8.94273L4.47206 12.4713C4.21171 12.7317 3.7896 12.7317 3.52925 12.4713C3.2689 12.211 3.2689 11.7889 3.52925 11.5285L7.05784 7.99992L3.52925 4.47132C3.2689 4.21097 3.2689 3.78886 3.52925 3.52851Z" fill="#4C505D"/>
        </svg>
    `,
    });
    const description = createElement("span", "egune-greeting-desc", { textContent: "Танд юугаар туслах вэ?" });
    const greetingMessage = createElement('span', "egune-greeting-message", {textContent: "Би статистик мэдээллийн хиймэл оюунт чатбот байна. "})
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
          max-width:230px;
          height: 100%;
          height: fit-content;
          padding: 10px 16px 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: fixed;
          right: 40px;
          bottom: 108px;
          box-sizing:border-box;
          box-shadow: 0px 4px 30px 0px rgba(0, 0, 0, 0.16);
          z-index: 1;
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
        }
        .egune-greeting-title {
          color: #353841;
          font-family: Inter;
          font-size: 14px;
          font-weight: 700;
          line-height: 24px;
          letter-spacing: -0.09px;
        }
        .egune-greeting-desc {
          color: #22242A;
          font-family: Inter;
          font-size: 14px;
          line-height: 24px;
          letter-spacing: -0.09px;
        }
        .egune-greeting-message {
          color: #22242A;
          font-family: Inter;
          font-size: 14px;
          line-height: 20px;
          letter-spacing: -0.09px;
        }
    `;
    document.head.appendChild(style);

    return greetingBox;
}

function initChat() {
    let chatBoxEl = document.getElementsByClassName("egune-chat-box")[0];
    chatBoxEl.innerHTML = `
    <iframe allow="microphone" id='chimegeChatBotId' scrolling="no" src="https://statgpt.egune.com/chatbot/" 
    style="border: none; margin: 0; padding: 0;display: flex;
    width: 100%; height: 100%; object-fit: cover; flex-direction: column;"></iframe>`;
    chatBoxEl.style = chatBoxStyle + `transform: scale(0);`;
    if (window.matchMedia("(max-width: 860px)").matches) {
        responsiveType = "full_screen";
    } else {
        responsiveType = "large";
    }
}

function buttonClick() {
    const greetingBox = document.getElementById("egune-greeting-box");
    const floatingBtn = document.getElementsByClassName("floating-btn")[0];
    const chatBoxEl = document.getElementsByClassName("egune-chat-box")[0];

    if (greetingBox) {
        greetingBox.style.display = "none";
    }

    floatingBtn.style.transform = "scale(1.0)";
    setTimeout(() => {
        floatingBtn.style.transform = "scale(1.1)";
    }, 150);

    if (!isOpen) {
        initChat();
    }

    const baseStyle = isOpen ? "opacity:0; transform: scale(0.3); visibility:hidden;" : "opacity:1; transform: scale(1); visibility:visible;";
    const typeStyle = responsiveType === "full_screen" ? full_screen_style : chatBoxStyle;

    chatBoxEl.style = `${typeStyle}${baseStyle}`;
    isOpen = !isOpen;
}

function mouseOver() {
    document.getElementsByClassName("floating-btn")[0].style.transform = "scale(1.1)";
}

function mouseLeave() {
    document.getElementsByClassName("floating-btn")[0].style.transform = "scale(1)";
}

window.addEventListener("message", handleMessage, false);

function handleMessage(event) {
    if (event.data == "close_iframe") {
        buttonClick();
    }
}
