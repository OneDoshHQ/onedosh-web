/*!
 * jquery.appear merged plugin
 * Combined from:
 *  - jQuery.appear by Michael Hixson (appear.js)
 *  - jQuery appear plugin by Andrey Sidorov (appear-2.js)
 */
(function($){
    // === Michael Hixson plugin ===
    (function(){
        var checks = [], timeout = null;
        $.fn._appearOld = function(fn, options) {
            var settings = $.extend({
                data: undefined,
                one: true,
                accX: 0,
                accY: 0
            }, options);

            return this.each(function() {
                var t = $(this);
                t.appeared = false;

                if (!fn) {
                    t.trigger('appear', settings.data);
                    return;
                }

                var w = $(window);
                var check = function() {
                    if (!t.is(':visible')) {
                        t.appeared = false;
                        return;
                    }

                    var a = w.scrollLeft(), b = w.scrollTop();
                    var o = t.offset(), x = o.left, y = o.top;
                    var ax = settings.accX, ay = settings.accY;
                    var th = t.height(), wh = w.height(), tw = t.width(), ww = w.width();

                    if (y + th + ay >= b && y <= b + wh + ay &&
                        x + tw + ax >= a && x <= a + ww + ax) {
                        if (!t.appeared) t.trigger('appear', settings.data);
                    } else {
                        t.appeared = false;
                    }
                };

                var modifiedFn = function() {
                    t.appeared = true;
                    if (settings.one) {
                        w.unbind('scroll', check);
                        var i = $.inArray(check, $.fn.appear.checks);
                        if (i >= 0) $.fn.appear.checks.splice(i, 1);
                    }
                    fn.apply(this, arguments);
                };

                if (settings.one) t.one('appear', settings.data, modifiedFn);
                else t.bind('appear', settings.data, modifiedFn);

                w.scroll(check);
                $.fn.appear.checks.push(check);
                check();
            });
        };

        $.extend($.fn._appearOld, {
            checks: checks,
            timeout: timeout,
            checkAll: function() {
                var length = checks.length;
                if (length > 0) while (length--) (checks[length])();
            },
            run: function() {
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout($.fn._appearOld.checkAll, 20);
            }
        });

        $.each(['append', 'prepend', 'after', 'before', 'attr',
            'removeAttr', 'addClass', 'removeClass', 'toggleClass',
            'remove', 'css', 'show', 'hide'], function(i, n) {
            var old = $.fn[n];
            if (old) {
                $.fn[n] = function() {
                    var r = old.apply(this, arguments);
                    $.fn._appearOld.run();
                    return r;
                };
            }
        });
    })();

    // === Andrey Sidorov plugin ===
    (function(){
        var selectors = [], checkBinded = false, checkLock = false,
            defaults = { interval: 250, force_process: false },
            $window = $(window), priorAppeared = [];

        function appearedFilter(selector) {
            return $(selector).filter(function() {
                return $(this).is(':appeared');
            });
        }
        function process() {
            checkLock = false;
            for (var index = 0; index < selectors.length; index++) {
                var $appeared = appearedFilter(selectors[index]);
                $appeared.trigger('appear', [$appeared]);
                if (priorAppeared[index]) {
                    var $disappeared = priorAppeared[index].not($appeared);
                    $disappeared.trigger('disappear', [$disappeared]);
                }
                priorAppeared[index] = $appeared;
            }
        }
        function addSelector(selector) {
            selectors.push(selector);
            priorAppeared.push();
        }

        $.expr.pseudos.appeared = $.expr.createPseudo(function() {
            return function(element) {
                var $e = $(element);
                if (!$e.is(':visible')) return false;
                var wl = $window.scrollLeft(), wt = $window.scrollTop(),
                    off = $e.offset(), left = off.left, top = off.top;
                if (top + $e.height() >= wt &&
                    top - ($e.data('appear-top-offset')||0) <= wt + $window.height() &&
                    left + $e.width() >= wl &&
                    left - ($e.data('appear-left-offset')||0) <= wl + $window.width()) {
                    return true;
                }
                return false;
            };
        });

        $.extend({
            appear2: function(selector, options) {
                var opts = $.extend({}, defaults, options || {});
                if (!checkBinded) {
                    var onCheck = function() {
                        if (checkLock) return;
                        checkLock = true;
                        setTimeout(process, opts.interval);
                    };
                    $window.scroll(onCheck).resize(onCheck);
                    checkBinded = true;
                }
                if (opts.force_process) setTimeout(process, opts.interval);
                addSelector(selector);
            },
            force_appear2: function() {
                if (checkBinded) {
                    process();
                    return true;
                }
                return false;
            }
        });

        $.fn._appear2 = function(options) {
            $.appear2(this, options);
            return this;
        };
    })();

    // === Unified API ===
    /**
     * $(element).appear(callback, options) — use callback-based detection (Hixson).
     * $(element).appear(options)         — use filter-based detection (Sidorov).
     */
    $.fn.appear = function(arg1, arg2) {
        if (typeof arg1 === 'function') {
            return this._appearOld(arg1, arg2);
        } else {
            return this._appear2(arg1);
        }
    };
})(jQuery);
