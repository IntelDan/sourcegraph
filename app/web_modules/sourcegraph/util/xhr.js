import {btoa} from "abab";
import "whatwg-fetch";

import context from "sourcegraph/app/context";

// This file provides a common entrypoint to the fetch API.
//
// Use the fetch API (not XHR) because it is the future standard and because
// we can intercept calls to fetch in the reactbridge to render React
// components on the server even if they fetch external data.

function defaultOptions() {
	let options = {
		headers: {
			"X-Csrf-Token": context.csrfToken,
			"X-Device-Id": context.deviceID,
		},
		credentials: "same-origin",
	};
	if (typeof document === "undefined") {
		options.compress = false;
	}
	if (context.authorization) {
		let auth = `x-oauth-basic:${context.authorization}`;
		options.headers["authorization"] = `Basic ${btoa(auth)}`;
	}
	if (context.cacheControl) {
		options.headers["Cache-Control"] = context.cacheControl;
	}
	if (context.currentSpanID) options.headers["Parent-Span-ID"] = context.currentSpanID;
	return options;
}

// defaultFetch wraps the fetch API.
//
// Note: the caller might wrap this with singleflightFetch.
export function defaultFetch(url, options) {
	if (typeof global !== "undefined" && global.process && global.process.env.JSSERVER) {
		url = `${context.appURL}${url}`;
	}

	let defaults = defaultOptions();

	// Combine headers.
	const headers = Object.assign({}, defaults.headers, options ? options.headers : null);

	return fetch(url, Object.assign(defaults, options, {headers: headers}));
}

// checkStatus is intended to be chained in a fetch call. For example:
//   fetch(...).then(checkStatus) ...
export function checkStatus(resp) {
	if (resp.status >= 200 && resp.status <= 299) return resp;
	return resp.text().then((body) => {
		if (typeof document === "undefined") {
			// Don't log in the browser because the devtools network inspector
			// makes it easy enough to see failed HTTP requests.
			console.error(`HTTP fetch failed with status ${resp.status} ${resp.statusText}: ${resp.url}: ${body}`);
		}
		if (resp.headers.get("Content-Type") === "application/json; charset=utf-8") {
			let err = new Error(resp.status);
			err.body = JSON.parse(body);
			throw err;
		}
		let err = new Error(resp.statusText);
		err.body = body;
		err.response = {status: resp.status, statusText: resp.statusText, url: resp.url};
		throw err;
	});
}
