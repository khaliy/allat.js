/*global root,Allat */
(function (Allat) {
    Allat.module.define("TemplateSupport", function (TemplateSupport) {

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
    }, [], true);
}(Allat));
