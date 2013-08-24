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
}());
