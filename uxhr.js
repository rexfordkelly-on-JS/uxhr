(function (root, factory) {
	if (typeof exports === 'object') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define('uxhr', factory);
	} else {
		root.uxhr = factory();
	}
}(this, function () {

	"use strict";

	return function (url, data, options) {
		data = data || '';
		options = options || {};

		var uri = document.createElement('a');
		uri.href = url;

		var complete = options.complete || function(){},
			success = options.success || function(){},
			error = options.error || function(){},
			timeout = options.timeout || 0,
			ontimeout = options.ontimeout || function(){},
			onprogress = options.onprogress || function(){},
			headers = options.headers || {},
			method = options.method || 'GET',
			sync = options.sync || false,
			isCors = (uri.hostname != location.hostname),
			req = (function() {

				if (typeof XMLHttpRequest !== 'undefined') {

					// CORS (IE8-9)
					if (isCors && typeof XDomainRequest !== 'undefined') {
						return new XDomainRequest();
					}

					// local, CORS (other browsers)
					return new XMLHttpRequest();

				} else if (typeof 'ActiveXObject' !== 'undefined') {
					return new ActiveXObject('Microsoft.XMLHTTP');
				}

			})();

		if (!req) {
			throw new Error ('Browser doesn\'t support XHR');
		}

		// serialize data?
		var hasFormData = (typeof(window.FormData) !== 'undefined');
		if (typeof data !== 'string' && (hasFormData && !(data instanceof window.FormData))) {
			var serialized = [];
			for (var datum in data) {
				serialized.push(datum + '=' + data[datum]);
			}
			data = serialized.join('&');
		}

		// use ? or &, accourding to given url
		if (method === 'GET' && data) {
			url += (url.indexOf('?') >= 0) ? '&' + data : '?' + data;
		}

		// open connection
		req.open(method, url, !sync);

		// set timeout
		// timeouts cannot be set for synchronous requests made from a document.
		if (!sync) {
			if ('ontimeout' in req) {
				req.timeout = timeout;
				req.ontimeout = ontimeout;
			}
		}

		// set onprogress
		if ('onprogress' in req) {
			req.onprogress = onprogress;
		}

		// listen for XHR events
		req.onload = function () {
			complete(req.responseText, req.status);
			success(req.responseText);
		};
		req.onerror = function () {
			complete(req.responseText);
			error(req.responseText, req.status);
		};

    if (typeof(req.setRequestHeader)!=="undefined") {
		  // set headers
		  for (var header in headers) {
		  	req.setRequestHeader(header, headers[header]);
		  }
    }

		// send it
    req.send(method !== 'GET' ? data : null);
		return req;
	};

}));
