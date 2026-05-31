/*jslint browser: true, devel: false, ass: true, maxlen: 100 */
/**
 * developer.js
 * 
 * This script is meant to be added to a game page.
 * Especially for mobile it watches for specific changes and
 * propagates them back to the parent or listenes to messages and
 * triggers emulated events. In this case viewport
 * updates from games have no effect if they don't run top frame. And the page
 * could otherwise not receive any orientation changes when it runs within a frame.
 *
 * This file will help to resolve that in the context of Game Player.
 *
 * todo: apply stucture
 *
 * @since 14/Oct/2013
 * @author Laurens van Hees <laurens.vanhees@spilgames.com>
 * Copyright (2013) Spil Games BV.
 */
(function (w, d, p) {
    'use strict';
    var utils = {
            getViewportMeta: function () {
                var metaTags = d.getElementsByTagName('meta'),
                    nameAttribute,
                    metaTagsCount,
                    result,
                    i;

                for (i = 0, metaTagsCount = metaTags.length; i < metaTagsCount; i += 1) {
                    nameAttribute = metaTags[i].getAttribute('name');
                    if (nameAttribute && nameAttribute === 'viewport') {
                        result = metaTags[i];
                        break;
                    }
                }

                // overwrite function and from now on directly
                // return the reference to the element for faster
                // future calls
                utils.getViewportMeta = function () {
                    return result;
                };

                return result;
            },

            addEventListener: (function () {
                var overwrite;
                if (w.addEventListener) {
                    overwrite = function (type, listener, element) {
                        element.addEventListener(type, listener, false);
                    };
                } else if (w.attachEvent) {
                    overwrite = function (type, listener, element) {
                        element.attachEvent('on' + type, listener);
                    };
                }

                return overwrite;
            }())
        },

        browserFeatures = {
            MutationObserver: function () {
                return !!w.MutationObserver;
            },
            WebKitMutationObserver: function () {
                return !!w.WebKitMutationObserver;
            },
            MozMutationObserver: function () {
                return !!w.MozMutationObserver;
            },
            DOMAttrModifiedEvent: function () {
                var testElem,
                    result = false,
                    onsupported = function () {
                        result = true;
                    };

                testElem = d.createElement('p');
                utils.addEventListener('DOMAttrModified', onsupported, testElem);

                testElem.setAttribute('id', 'test');
                return result;
            },
            PropertyChangeEvent: function () {
                var result = false;

                if (d.body && d.body.hasOwnProperty('onpropertychange')) {
                    result = true;
                }

                return result;
            }
        },

        viewportElement = utils.getViewportMeta(),
        oldViewportValue,
        viewportObserver,
        isObserving,

        MutationObserver = (function () {
            var observer;

            if (
                browserFeatures.MutationObserver() ||
                    browserFeatures.WebKitMutationObserver() ||
                    browserFeatures.MozMutationObserver()
            ) {
                observer = w[(
                    browserFeatures.MutationObserver() ? 'MutationObserver' : (
                        browserFeatures.WebKitMutationObserver() ? 'WebKitMutationObserver' : 'MozMutationObserver'
                    )
                )];
            } else {
                // no native mutation observer available
                // simple polyfill/shim that only flies for this case
                observer = function (mutationHandler) {
                    return {
                        observe: function (elementToObserve) {
                            if (browserFeatures.DOMAttrModifiedEvent()) {
                                utils.addEventListener('DOMAttrModified', function (evnt) {
                                    var mutations = [];

                                    mutations.push({
                                        attributeName: evnt.attrName
                                    });

                                    mutationHandler.call(this, mutations);
                                }, elementToObserve);
                            } else if (browserFeatures.PropertyChangeEvent()) {
                                utils.addEventListener('propertychange', function () {
                                    var mutations = [];

                                    mutations.push({
                                        attributeName: w.event.propertyName
                                    });

                                    mutationHandler.call(this, mutations);
                                }, elementToObserve);
                            } else {
                                // no methods available to observe
                                return false;
                            }
                        }
                    };
                };
            }

            return observer;
        }()),

        viewportMutationHandler = function (mutations) {
            var mutationKey,
                mutation;

            for (mutationKey in mutations) {
                if (mutations.hasOwnProperty(mutationKey)) {
                    mutation = mutations[mutationKey];
                    if (
                        //@todo: jslint complains, though this time we're propably right..
                        mutations.hasOwnProperty(mutationKey) &&
                            'content' === mutation.attributeName &&
                            viewportElement.content !== oldViewportValue
                    ) {
                        oldViewportValue = viewportElement.content;
                        p.postMessage({
                            mssg: 'updateViewport',
                            content: viewportElement.content
                        }, '*');
                    }
                }
            }
        },
        pollSequenceMap,
        pollCount,
        lifetime,
        pollForMutation;

    if (viewportElement) {
        oldViewportValue = viewportElement.content;

        viewportObserver = new MutationObserver(viewportMutationHandler);

        isObserving = viewportObserver.observe(viewportElement, {
            attributes: true,
            childList: false,
            characterData: true
        });

        if (false === isObserving) {
            // Note: this is definetly not the way we would wish it to be
            // but if there is no MutationObserver, no DOMAttrModified and no
            // onpropertychange method (Android 4.3 and lower for example) then
            // we unfortunately have to poll for changes (these constant CPU cycles are bad
            // for battery and performance..)
            // I tried overwriting the native Element.prototype.setAttribute,
            // but it will not do enough, property changes can happen directly
            // on the property without setAttribute being used so an overwrite
            // won't catch everything we want
            // the below implementation takes the above drawbacks into account
            // and reduces the impact on performance and battery by working with
            // a sequence map
            pollSequenceMap = {
                startWith: 500,
                endWith: 2000,
                slowDownAt: 5000,
                stopAt: 60000
            };
            pollCount = 0;
            lifetime = 0;


            pollForMutation = function (waitTime) {
                w.setTimeout(function () {
                    var newPollTime;

                    // check for viewport content changes
                    if (viewportElement.content !== oldViewportValue) {
                        viewportMutationHandler.call(this, [{
                            attributeName: 'content'
                        }]);
                    }

                    pollCount = pollCount + 1;

                    // check it again, but figure out how long
                    // to wait before checking
                    lifetime = lifetime + waitTime;
                    newPollTime = pollSequenceMap.startWith;

                    if (lifetime >= pollSequenceMap.slowDownAt) {
                        newPollTime = pollSequenceMap.endWith;
                    }

                    if (lifetime < pollSequenceMap.stopAt) {
                        // recursion
                        pollForMutation.call(this, newPollTime);
                    }
                }, waitTime);
            };

            pollForMutation(pollSequenceMap.startWith);
        }

        w.parent.postMessage({
            mssg: 'updateViewport',
            content: viewportElement.content,
            initial: true
        }, '*');

        // Listen to orientation change events from the parent
        // and emulate the native event once send
        utils.addEventListener('message', function (message) {
            if (
                message &&
                    message.data.mssg &&
                    message.data.mssg === 'orientationchange'
            ) {
                var orientationEvent = d.createEvent('Event');

                orientationEvent.initEvent('orientationchange', true, true);
                orientationEvent.orientation = message.data.orientation;

                w.dispatchEvent(orientationEvent);

                // scroll back due to minimal-ui bug
                w.scrollTo(0, 0);
            }
        }, w);
    }
}(window, window.document, window.parent));
