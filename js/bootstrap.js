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

    /**
     * Utility method to convert anything array like to valid array.
     * @param obj
     * @returns {Array}
     */
    function makeArray(obj) {
        var arr = [], i, ref;
        for (i = 0, ref = arr.length = obj.length; i < ref; i++) {
            arr[i] = obj[i];
        }
        return arr;
    }
    util.makeArray = makeArray;

    /**
     * Utility function to escape characters which are special in html, like .,',",<,> and /
     * @param {string} str
     * @returns {string}
     */
    function escape(str) {
        str = str.replace(/[\.'"<>\/]/g, "");
        return str;
    }
    util.escape = escape;

    Allat.util = util;
}(Allat));
