(() => {
    const {
        operators: {
            map,
            pairwise,
        }
    } = rxjs;

    const inspectDifferences = array$ =>
        array$
            .pipe(
                pairwise(),
                map(([previous, current]) => {
                        const kept = [];
                        const added = [];

                        const cache = new Set(previous);

                        for (const item of current) {
                            if (cache.has(item)) {
                                kept.push(item);
                                cache.delete(item);
                            } else {
                                added.push(item);
                            }
                        }

                        const removed = [...cache.values()];

                        return { kept, added, removed };
                    }
                )
            );

    const makeListBinder = (init, update) => {
        const unsubscribeMapping = new Map();

        return ({ added, removed }) => {
            for (const item$ of added) {
                bind(item$, init, update, unsubscribeMapping);
            }

            for (const item of removed) {
                unsubscribeMapping.get(item)();
            }
        };
    };

    const bind = (value$, init, update, unsub = null) => {
        const element = init(value$);
        const unsubscribe = value$.subscribe(value => update(element, value));

        unsub.set(value$, () => {
            unsubscribe();
            element.remove();
            if (element.subscriptions) {
                for (const subscription of element.subscriptions) {
                    subscription.unsubscribe();
                }
            }

            unsub.delete(value$);
        });

        return element;
    };

    const bindMany = (items$, root, {init, update}) =>
        items$
            .pipe(inspectDifferences)
            .subscribe(makeListBinder(init, update));

    const html = code => {
        const element = document.createElement("div");
        element.outerHTML = code;
        element.subscriptions = [];
        return element;
    };

    window.tinyRxDom = { bind, bindMany, html };
})();