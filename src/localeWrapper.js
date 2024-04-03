import React, { useState } from "react";
import { IntlProvider } from "react-intl";
import Myanmar from "./locales/mm.json";
import English from "./locales/en.json";

export const Context = React.createContext();

// const userLocale = navigator.language;
const userLocale = "en";

let lang;
if (userLocale === "en") {
  lang = English;
} else if (userLocale === "mm") {
  lang = Myanmar;
}

const Wrapper = (props) => {
  const [locale, setLocale] = useState(userLocale);
  const [messages, setMessages] = useState(lang);

  function selectLanguage(value) {
    const newLocale = value;
    setLocale(newLocale);
    if (newLocale === "en") {
      setMessages(English);
    } else if (newLocale === "mm") {
      setMessages(Myanmar);
    }
  }

  return (
    <Context.Provider value={{ locale, selectLanguage }}>
      <IntlProvider messages={messages} locale={locale}>
        {props.children}
      </IntlProvider>
    </Context.Provider>
  );
};

export default Wrapper;
