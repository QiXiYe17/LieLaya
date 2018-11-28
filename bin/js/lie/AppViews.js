var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var lie;
(function (lie) {
    var app; // 存放单例
    var getTop = function (view) {
        return view._childs[view.numChildren - 1];
    };
    /**
     * 层级容器
     */
    var Container = /** @class */ (function (_super) {
        __extends(Container, _super);
        function Container() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * 移除子控件触发
         */
        Container.prototype.removeChildAt = function (index) {
            var self = this;
            var node = _super.prototype.removeChildAt.call(this, index);
            // 移除成功且为该层级最顶层控件
            if (node) {
                var num = self.numChildren;
                if (index == num) {
                    // 当前层级最顶层
                    var last = AppViews.getTopComponent(self);
                    if (last) {
                        var onShow = last.onShow;
                        onShow && last.onShow();
                    }
                }
            }
            return node;
        };
        /**
         * 重写子控件发生变化
         */
        Container.prototype._childChanged = function (child) {
            _super.prototype._childChanged.call(this, child);
            var self = this;
            self.mouseEnabled = self.numChildren > 0;
        };
        return Container;
    }(Laya.Sprite));
    /**
     * 应用的视图层级管理类
     */
    var AppViews = /** @class */ (function () {
        function AppViews() {
        }
        /**
         * 初始化
         */
        AppViews.prototype.init = function () {
            var self = this;
            var clzz = AppViews;
            Laya.stage.destroyChildren();
            // 层级部署
            self.$panelLevel = self.addLevel('panel');
            // 对话框
            self.$dialogLevel = self.addLevel('dialog');
            //Laya.Dialog.manager;
            // dialog.name = 'dialog';
            // 顶层
            self.$topLevel = self.addLevel('top');
        };
        Object.defineProperty(AppViews.prototype, "panelLevel", {
            /**
             * 获取面板层
             */
            get: function () {
                return this.$panelLevel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppViews.prototype, "dialogLevel", {
            /**
             * 获取对话框层
             */
            get: function () {
                return this.$dialogLevel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppViews.prototype, "topLevel", {
            /**
             * 获取最顶层，注：顶层的东西随便加，记得清理
             */
            get: function () {
                return this.$topLevel;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 添加层
         * @param name 名称
         */
        AppViews.prototype.addLevel = function (name) {
            var stage = Laya.stage;
            var container = new Container;
            container.name = name;
            container.width = stage.width;
            container.height = stage.height;
            stage.addChild(container);
            return container;
        };
        /**
         * 获取层
         */
        AppViews.prototype.getLevel = function (name) {
            return Laya.stage.getChildByName(name);
        };
        /**
         * 设置3D场景的容器
         * @param scene 场景
         * @param index 位置，默认最底，也就是说置于2D场景之下
         * @param name 名称，多个场景时需要通过该值进行区分，暂未实现
         */
        AppViews.prototype.setScene = function (scene, index, name) {
            if (index === void 0) { index = 0; }
            if (name === void 0) { name = '3dScene'; }
            scene.name = name;
            Laya.stage.addChildAt(scene, index);
        };
        Object.defineProperty(AppViews, "isInit", {
            // 静态
            /**
             * 是否初始化界面
             */
            get: function () {
                return !!app;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 获取视图管理类单例
         */
        AppViews.app = function () {
            if (!app) {
                app = new AppViews;
                app.init();
            }
            return app;
        };
        /**
         * 设置屏幕是否能点击
         */
        AppViews.setTouchEnable = function (enable) {
            Laya.stage.mouseEnabled = enable;
        };
        // 重点，层及控制管理体现
        /**
         * 获取当前面板的最顶元素（该面板没有则取下一面板）
         */
        AppViews.getTopComponent = function (cont) {
            if (cont.numChildren == 0) {
                var parent_1 = cont.parent;
                var index = parent_1.getChildIndex(cont);
                cont = null;
                for (var i = index - 1; i >= 0; i--) {
                    cont = parent_1.getChildAt(i);
                    // 仅非空容器
                    if (cont instanceof Container && cont.numChildren)
                        break;
                }
                if (!cont)
                    return null;
            }
            return cont._childs[cont.numChildren - 1];
        };
        /**
         * 获取最顶的控件——对话框之下
         */
        AppViews.getTopCommont = function () {
            return AppViews.getTopComponent(AppViews.app().dialogLevel);
        };
        Object.defineProperty(AppViews, "curPanel", {
            /**
             * 获取当前面板
             */
            get: function () {
                return app && getTop(app.panelLevel);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppViews, "curDialog", {
            /**
             * 获取当前对话框
             */
            get: function () {
                return app && getTop(app.dialogLevel);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppViews, "curTop", {
            /**
             * 获取当前顶层控件
             */
            get: function () {
                return app && getTop(app.topLevel);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 插入一个控件，并居中
         * @param attr AppViews对象的属性名
         * @param clzz 需要添加的对象类
         */
        AppViews.pushChild = function (attr, clzz, data) {
            var self = AppViews;
            var child = new clzz(data);
            var container = self.app()[attr];
            var last = self.getTopComponent(container); // 当前层级最顶层
            // 隐藏
            if (last) {
                var onHide = last.onHide;
                onHide && last.onHide();
            }
            self.setInCenter(child);
            container.addChild(child);
            return child;
        };
        /**
         * 移除层里的控件
         * @param attr AppViews对象的属性名
         * @param clzz 需要移除的对象类
         */
        AppViews.removeChild = function (attr, clzz) {
            var panel = AppViews.app()[attr];
            var num = panel.numChildren;
            if (num > 0) {
                var top_1 = panel.getChildAt(num - 1);
                for (var i = 0; i < num; i++) {
                    var child = panel.getChildAt(i);
                    if (child instanceof clzz) {
                        panel.removeChildAt(i);
                        i--;
                        num--;
                    }
                }
            }
        };
        /**
         * 移除clzz其上面的面板，clzz不传参时则返回上一级
         */
        AppViews.backChild = function (attr, clzz, data) {
            var self = AppViews;
            var panel = self.app()[attr];
            var num = panel.numChildren;
            if (!clzz) {
                panel.removeChildAt(--num);
            }
            else {
                var bool = false;
                for (var i = 0; i < num; i++) {
                    var child = panel.getChildAt(i);
                    if (child instanceof clzz) {
                        i++;
                        for (var j = i; j < num; j++)
                            panel.removeChildAt(i);
                        bool = true;
                        break;
                    }
                }
                !bool && self.pushChild(attr, clzz, data);
            }
        };
        /**
         * 将子控件设置在父控件中心点
         */
        AppViews.setInCenter = function (child) {
            var stage = Laya.stage;
            child.x = (stage.width - child.width) / 2;
            child.y = (stage.height - child.height) / 2;
        };
        /**
         * 新建一个面板并放入
         */
        AppViews.pushPanel = function (clzz, data) {
            return AppViews.pushChild('panelLevel', clzz, data);
        };
        /**
         * 新建一个对话框并放入
         */
        AppViews.pushDialog = function (clzz, data) {
            return AppViews.pushChild('dialogLevel', clzz, data);
        };
        /**
         * 新建一个顶层控件并放入
         */
        AppViews.pushTop = function (clzz, data) {
            return AppViews.pushChild('topLevel', clzz, data);
        };
        /**
         * 移除面板
         */
        AppViews.removePanel = function (clzz) {
            AppViews.removeChild('panelLevel', clzz);
        };
        /**
         * 移除对话框
         */
        AppViews.removeDialog = function (clzz) {
            AppViews.removeChild('dialogLevel', clzz);
        };
        /**
         * 移除顶层控件
         */
        AppViews.removeTop = function (clzz) {
            AppViews.removeChild('topLevel', clzz);
        };
        /**
         * 移除clzz其上面的面板，clzz不传参时则返回上一面板，不存在则创建
         * @param clzz 需要回到的面板
         * @param data 如果不存在面板，则用于构造函数参数，否则不需要传
         */
        AppViews.backPanel = function (clzz, data) {
            AppViews.backChild('panelLevel', clzz);
        };
        return AppViews;
    }());
    lie.AppViews = AppViews;
})(lie || (lie = {}));
//# sourceMappingURL=AppViews.js.map