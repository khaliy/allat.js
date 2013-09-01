(function () {
    Object.getKeys = Object.getKeys || function (obj) {
        var keys = [], key;
        for (key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                keys.push(key);
            }
        }
        return keys;
    };
    Array.prototype.forEach = Array.prototype.forEach || function (fn, scope) {
        'use strict';
        var i, len = this.length;
        for (i = 0; i < len; ++i) {
            if (!!this[i]) {
                fn.call(scope, this[i], i, this);
            }
        }
    };

}());
