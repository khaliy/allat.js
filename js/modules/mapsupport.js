/*global Allat */
(function (Allat) {
    Allat.module.define("MapSupport", {
        factory: function (MapSupport) {
            var Map = function () {
                this._map = {};
            };

            Map.prototype.add = function (key, value) {
                var values = this._map[key] || [];
                values.push(value);
                this._map[key] = values;
            };
            Map.prototype.remove = function (key, value) {
                var values = this._map[key], i;
                for (i = 0; i < values.length; i++) {
                    if (value === values[i]) {
                        this._map[key] = values.splice(i, 1);
                        break;
                    }
                }
                return value;
            };
            Map.prototype.contains = function (key, value) {
                var values = this._map[key], i;
                for (i = 0; i < values.length; i++) {
                    if (value === values[i]) {
                        return true;
                    }
                }
                return false;
            };
            Map.prototype.getValues = function (key) {
                return this._map[key];
            };
            Map.prototype.getKeys = function () {
                return Object.getKeys(this._map);
            };

            MapSupport.createMap = function () {
                return new Map();
            };
            return MapSupport;
        },
        singleton: true
    });
}(Allat));
