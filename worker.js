// Simple worker to enforce HTTPS redirects
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Redirect HTTP to HTTPS
        if (url.protocol === 'http:') {
            url.protocol = 'https:';
            return Response.redirect(url.toString(), 301);
        }

        // For HTTPS requests, serve the static assets
        return env.ASSETS.fetch(request);
    },
};
