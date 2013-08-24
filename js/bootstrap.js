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
     * Map to watch modules already loaded
     * @type Object.<String,function>
     */
    ModuleSupport._watches = {};

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
     * @param {function(DefaultModule):DefaultModule} factory Factory object to create the module
     * @param {Array=} dependencies list of other _modules to be injected as _singletons
     * @param {Boolean=} singleton if true only one instance will be created
     */
    function define(name, factory, dependencies, singleton) {
        var keys, key, modules, l, i, module, m, j;
        if (!ModuleSupport._modules[name]) {
            ModuleSupport._modules[name] = {
                build: function () {
                    var module = factory(defaultModuleFactory(name));
                    return inject(module, dependencies);
                },
                singleton: singleton
            };
        }
        keys = Object.getKeys(ModuleSupport._watches);
        l = keys.length;
        to: for (i = 0; i < l; i++) {
            key = keys[i];
            modules = key.split(/[\s,]/);
            m = modules.length;
            for (j = 0; j < m; j++) {
                module = modules[j];
                if (!ModuleSupport._modules[module]) {
                    break to;
                }
            }
            ModuleSupport._watches[key]();
            delete ModuleSupport._watches[key];
        }
    }

    ModuleSupport.define = define;

    /**
     * Delay a logic after a module is defined
     * @param {string} modules names of modules to wait for
     * @param {function} callback the logic
     */
    function loaded(modules, callback) {
        ModuleSupport._watches[modules] = callback;
    }

    ModuleSupport.loaded = loaded;

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
