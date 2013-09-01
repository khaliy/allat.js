var root = (function() {return this; }());
if (root.Allat) {
    throw new Error("Allat.js is already initialized.");
}
root.Allat = {};
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
/*global Allat */
(function (Allat) {

    /**
     * @namespace
     */
    var ModuleSupport = {};

    function noop() { return undefined; }

    /**
     * Base module for module support
     * @constructor
     * @param name The name of the module
     */
    function DefaultModule(name) {
        this.name = name;
    }
    DefaultModule.prototype = {
        services: [],
        version: "0.1",
        name: "DefaultModule",
        init: noop,
        /**
         * Utility method on module to register other modules or services (singleton modules)
         * @param {String} service the name of the module or service
         * @param {DefaultModule} impl the module instance
         */
        setup: function (service, impl) {
            this.services[service] = impl;
        },
        getName: function () {
            return this.name;
        },
        clear: noop
    };

    /**
     * Map to hold name of the modules and their factory methods
     * @type Object.<String,Object>
     * @private
     */
    ModuleSupport._modules = {};

    /**
     * Map to hold singleton instances of singleton services to reuse
     * @type Object.<String,DefaultModule>
     * @private
     */
    ModuleSupport._singletons = {};

    /**
     * Default factory implementation for Modules
     * @returns {DefaultModule}
     */
    function defaultModuleFactory(name) {
        return new DefaultModule(name);
    }
    ModuleSupport.defaultModuleFactory = defaultModuleFactory;

    /**
     * @param name Module to be created
     */
    function instantiate(name) {
        var module = ModuleSupport._modules[name],
            instance = ModuleSupport._singletons[name];
        if (!instance) {
            if (module && module.build) {
                instance = (module && module.build)();
                instance.init();
                if (module && module.singleton) {
                    ModuleSupport._singletons[name] = instance;
                }
            } else {
                throw new Error("Unable to load module " + name);
            }
        }
        return instance;
    }
    ModuleSupport.instantiate = instantiate;
    /**
     * DI utility method to inject dependencies for a module
     * @param {DefaultModule} module module where the dependencies should be injected in
     * @param {Array} dependencies list of module names to be injected
     * @returns {DefaultModule} original module where dependencies already injected
     */
    function inject(module, dependencies) {
        var dependency, instance, i;
        if (dependencies) {
            for (i = 0; i < dependencies.length; i++) {
                dependency = dependencies[i];
                instance = instantiate(dependency);
                module.setup(dependency, instance);
            }
        }
        return module;
    }

    ModuleSupport.inject = inject;
    /**
     * @param {string} name Module's name
     * @param {{factory:function, dependencies:Array, singleton:Boolean}} options object
     */
    function define(name, options) {
        var factory, dependencies, singleton;
        factory = options.factory || function (obj) {return obj; };
        dependencies = options.dependencies || [];
        singleton = options.singleton || false;

        if (!ModuleSupport._modules[name]) {
            ModuleSupport._modules[name] = {
                build: function () {
                    var module = factory(defaultModuleFactory(name));
                    return inject(module, dependencies);
                },
                singleton: singleton
            };
        }
    }

    ModuleSupport.define = define;

    Allat.module = ModuleSupport;

}(Allat));

(function (Allat) {

    /**
     * @namespace
     */
    var util = {};

    /**
     * Proxy utility to bind a function to a scope
     * @param {function} func
     * @param {Object} scope
     * @returns {function}
     */
    function proxy(func, scope) {
        return function() {
            return func.apply(scope || this, arguments);
        };
    }
    util.proxy = proxy;

    Allat.util = util;
}(Allat));
/*global Allat */
(function (Allat) {
    Allat.module.define("EventBus", {
        factory: function (EventBus) {
            EventBus.init = function () {
                this._subscribers = this.services.MapSupport.createMap();
            };
            /**
             * @param {String} event
             * @param {function} handler
             */
            EventBus.subscribe = function (event, handler) {
                this._subscribers.add(event, handler);
            };
            EventBus.unSubscribe = function (event, handler) {
                this._subscribers.remove(event, handler);
            };
            EventBus.fireEvent = function (event, data) {
                var handlers = this._subscribers.getValues(event), i;
                if (!handlers || !handlers.length) {
                    return;
                }
                for (i = 0; i < handlers.length; i++) {
                    if (handlers[i](event, data)) {
                        break;
                    }
                }
            };
            return EventBus;
        },
        dependencies: ["MapSupport"],
        singleton: true
    });
}(Allat));
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
/*global Allat */
(function (Allat) {
    Allat.module.define("PropertyBindSupport", {
        factory: function (PropertyBindSupport) {
            PropertyBindSupport.init = function() {
                var template, i, boundTo, key, p = Allat.util.proxy,
                    createChangeHandler = p(function(key, template) {
                        return p(function (e) {
                            var value = e.target.value;
                            this.dictionary[key] = {
                                template: template,
                                boundTo: e.target,
                                value: value
                            };
                            template.innerHTML = value;
                            this.services.EventBus.fireEvent("property.updated", {
                                key: key,
                                value: value
                            });
                        }, this);
                    }, this);
                this.dictionary = {};
                this.templates = document.getElementsByClassName("bind");
                for (i = 0; i < this.templates.length; i++) {
                    template = this.templates[i];
                    if (template.attributes["data-bind"]) {
                        key = template.attributes["data-bind"].value;
                        boundTo = document.getElementById(key);
                        boundTo.onchange = createChangeHandler(key, template);
                        boundTo.onkeyup = boundTo.onchange;
                        boundTo.onchange({
                            target: boundTo
                        });
                    }
                }
                /*jslint unparam: true*/
                this.services.EventBus.subscribe("property.set", p(function (event, data) {
                    if (this.resolve(data.key)) {
                        this.update(data.key, data.value);
                    }
                }, this));
                /*jslint unparam: false*/
            };
            PropertyBindSupport.resolve = function (key) {
                return this.dictionary[key].value;
            };
            PropertyBindSupport.update = function (key, value) {
                this.dictionary[key].value = value;
                this.dictionary[key].boundTo.value = value;
                this.dictionary[key].boundTo.onchange({
                    target: this.dictionary[key].boundTo
                });
                return value;
            };
            return PropertyBindSupport;
        },
        dependencies: ["EventBus"],
        singleton: true
    });
}(Allat));
/*global root,Allat */
(function (Allat) {
    Allat.module.define("TemplateSupport", {
        factory: function (TemplateSupport) {

            function addSimpleTemplate() {
                var SimpleTemplate = {
                    render: function (template, data) {
                        var keys = Object.getKeys(data), l = keys.length, i, regex;
                        for (i = 0; i < l; i++) {
                            regex = new RegExp("{" + keys[i] + "}", "g");
                            template = template.replace(regex, data[keys[i]]);
                        }
                        return template;
                    }
                };
                TemplateSupport.addEngine("SimpleTemplate", {
                    engine: SimpleTemplate,
                    renderFn: function (template, data) {
                        return SimpleTemplate.render(template, data);
                    }
                });
            }

            function detectTemplateSystems() {
                var engines = {
                    Mustache: function (template, data) {
                        return root.Mustache.render(template, data);
                    }
                }, keys = Object.getKeys(engines), l = keys.length, i, engine, renderFn;
                for (i = 0; i < l; i++) {
                    engine = keys[i];
                    renderFn = engines[engine];
                    if (Object.prototype.hasOwnProperty.call(root, engine)) {
                        TemplateSupport.addEngine(engine, {
                            engine: root[engine],
                            renderFn: renderFn
                        });
                    }
                }
            }

            TemplateSupport.init = function() {
                addSimpleTemplate();
                detectTemplateSystems();
            };

            TemplateSupport.addEngine = function(name, engineDef) {
                TemplateSupport.ENGINES[name] = engineDef;
                this.setEngine(name);
            };
            TemplateSupport.setEngine = function(name) {
                this.engine = TemplateSupport.ENGINES[name];
            };

            TemplateSupport.render = function (template, data) {
                return this.engine.renderFn(template, data);
            };

            TemplateSupport.ENGINES = {};

            return TemplateSupport;
        },
        singleton: true
    });
}(Allat));
/*global root,Allat */
(function (Allat) {
    var $, prevHandler;
    if (root.jQuery) {
        $ = root.jQuery;
    } else {
        $ = function(callback) {
            prevHandler = root.onload;
            root.onload = function (e) {
                if (prevHandler) {
                    prevHandler(e);
                }
                if (callback) {
                    callback(e);
                }
            };
        };
    }
    Allat.module.define("BootModule", {
        factory: function (BootModule) {
            BootModule.init = function() {
                $(Allat.util.proxy(function () {
                    this.services.EventBus.fireEvent("load");
                }, this));
            };
            return BootModule;
        },
        dependencies: ["EventBus"],
        singleton: true
    });

    Allat.module.instantiate("BootModule");
}(Allat));
