const beginningSlashRegex = /^[\\\/]/;

export function request<Args>(configs: HttpConfigNormalized<Args>[], args: Args) {
    const context = createHttpContext(configs, args);

    const request = new Request(context.url, {
        method: context.method,
        headers: context.headers,
        body: context.body instanceof FormData ? context.body : JSON.stringify(context.body)
    });

    return fetch(request);
}

function createHttpContext(configs: HttpConfigNormalized<any>[], args: any) {
    return configs.reduce<HttpContext>((context, config) => {
        const url = config.url(args);
        if (beginningSlashRegex.test(url)) {
            context.url = url;
        } else {
            context.url += url;
        }

        const method = config.method;
        context.method = method ?? context.method;

        const headers = config.headers(args);
        if (headers instanceof Headers) {
            appendEntries(context.headers, headers);
        } else {
            appendEntries(context.headers, Object.entries(headers));
        }

        const query = config.query(args);
        if (query instanceof URLSearchParams) {
            appendEntries(context.query, query);
        } else {
            appendEntries(context.query, Object.entries(query));
        }

        const body = config.body(args);
        if (body instanceof FormData) {
            if (!(context.body instanceof FormData)) {
                const formData = new FormData();
                appendEntries(formData, Object.entries(context.body));
                context.body = formData;
            }
            appendEntries(context.body, body);
        } else {
            Object.assign(context.body, body);
        }

        return context;
    }, {
        url: '',
        method: 'get',
        headers: new Headers(),
        query: new URLSearchParams(),
        body: {}
    });
}

function appendEntries(appendable: Appendable, entries: Iterable<KeyValuePair<string, unknown>>) {
    for (const [key, value] of entries) {
        appendable.append(key, value);
    }
}