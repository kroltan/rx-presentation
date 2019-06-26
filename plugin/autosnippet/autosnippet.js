if (window["Prism"]) {
    Prism.hooks.add('before-highlight', function(env) {
        env.element.innerHTML = env.element.innerHTML.replace(/<br\s*\/?>/g,'\n');
        env.code = env.element.textContent.replace(/^(?:\r?\n|\r)/,'');
    });
}

for (const wrapper of document.querySelectorAll("[data-autosnippet]")) {
    const frame = wrapper.querySelector("iframe");
    const code = wrapper.querySelector("code");

    frame.addEventListener("load", () => {
        const source = frame.contentWindow.document.querySelector("script:not([src])").innerText
            .replace(/^(?:.|\n)*\/\* begin \*\/\n?/, "")
            .replace(/\n?\/\* end \*\/(?:.|\n)*$/, "");

        const lines = source
            .split("\n")
            .filter((line, i) => i > 0 || line.trim().length > 0);

        const spaceCount = lines.reduce((accumulated, line) => {
            if (line.length === 0) {
                return accumulated;
            }

            const matches = /^\s+(?!\s|$)/.exec(line);
            if (!matches) {
                return accumulated;
            }

            const prefix = matches[0].length;
            return Math.min(prefix, accumulated);
        }, Infinity);

        const formatted = lines
            .map(line => line.substring(spaceCount))
            .join("\n");

        const clean = formatted;

        code.innerText = clean;

        if (wrapper.dataset["autosnippet"] === "code-only") {
            frame.remove();
        }

        if (window["hljs"]) {
            code.classList.add("hljs");
            code.classList.add("js");
            hljs.highlightBlock(code);
        }

        if (window["Prism"]) {
            code.classList.add("language-js");
            Prism.highlightElement(code);
        }
    });
}