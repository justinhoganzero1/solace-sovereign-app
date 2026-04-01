type PageUrlContext = {
    appFace?: string;
    from?: string;
};

export function createPageUrl(pageName: string, context?: PageUrlContext) {
    const pathname = '/' + pageName.replace(/ /g, '-');

    if (!context?.appFace && !context?.from) {
        return pathname;
    }

    const params = new URLSearchParams();

    if (context.appFace) {
        params.set('appFace', context.appFace);
    }

    if (context.from) {
        params.set('from', context.from);
    }

    return `${pathname}?${params.toString()}`;
}