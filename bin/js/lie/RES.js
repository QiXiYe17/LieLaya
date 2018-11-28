var lie;
(function (lie) {
    /**
     * 初始化
     */
    var isInit, init = function () {
        if (!isInit) {
            isInit = true;
            // 初始化获取资源
            var Loader = Laya.Loader;
            var urlCache = RES.urlCache;
            var cacheRes = Loader.cacheRes, atlas = Laya.Loader.ATLAS /*, need = RES.needPrefix*/;
            // 设置缓存：url，起始坐标，名称前缀
            var setCache = function (url, start) {
                var end = url.lastIndexOf('.');
                var name = url.substring(start, end) + '_' + url.substr(end + 1);
                urlCache[name] = url;
            };
            var baseUrl = Laya.URL.basePath;
            Loader.cacheRes = function (url, data) {
                cacheRes.call(Loader, url, data);
                // 存放别名
                if (url.indexOf(baseUrl) == 0)
                    url = url.substr(baseUrl.length);
                setCache(url, url.lastIndexOf('/') + 1);
            };
        }
    };
    /**
     * 资源加载工具类
     */
    var RES = /** @class */ (function () {
        function RES() {
        }
        /**
         * 根据资源类型获取3D对应的类，待完善
         * @param type 资源类型
         */
        RES.get3DClass = function (type) {
            var clzz;
            type = type.toLowerCase();
            switch (type) {
                case 'scene':
                    clzz = Laya.Scene;
                    break;
                case 'blin':
                    clzz = Laya.BlinnPhongMaterial;
                    break;
            }
            return clzz;
        };
        /**
         * 加载资源配置文件，如不加载，后续方法无法执行
         * @param resUrl 资源配置文件路径
         */
        RES.loadConfig = function (resUrl) {
            var self = RES;
            var loader = Laya.loader;
            init();
            return new Promise(function (resolve) {
                loader.load(resUrl, lie.Utils.createHandler(function (bool) {
                    if (self.$isInit = bool) {
                        var urlCache = RES.urlCache;
                        var resData = loader.getRes(resUrl);
                        var groups = resData.groups;
                        var resources = resData.resources;
                        var config = self.$config = {};
                        var cGroups = config.groups = {};
                        var cResources = config.resources = {};
                        // 复制资源
                        for (var i in resources) {
                            var resource = resources[i];
                            var name_1 = resource.name;
                            cResources[name_1] = resource;
                            urlCache[name_1] = resource.url;
                        }
                        // 复制组
                        for (var i in groups) {
                            var group = groups[i];
                            var gName = group.name;
                            var array = cGroups[gName] = group.keys.split(',');
                            var length_1 = array.length;
                            for (var i_1 = 0; i_1 < length_1; i_1++) {
                                var item = cResources[array[i_1]];
                                if (item)
                                    item.group = gName;
                                // 错误的组内资源
                                else {
                                    array.splice(i_1, 1);
                                    i_1--;
                                    length_1--;
                                }
                            }
                        }
                    }
                    resolve(bool);
                }));
            });
        };
        /**
         * 添加资源配置
         * @param name 别称
         * @param url 路径
         * @param group 组名
         */
        RES.addConfig = function (resItem) {
            var config = RES.$config;
            if (config) {
                var name_2 = resItem.name;
                var gName = resItem.group;
                // 创建或者放入已存在的组
                if (gName) {
                    var groups = config.groups;
                    (groups[gName] || (groups[gName] = [])).push(name_2);
                }
                config.resources[name_2] = resItem;
            }
        };
        /**
         * 加载资源组
         * @param groupName 组名
         * @param progress 进度获取对象
         * @param is3d 是否是存放3D资源的组，3d的加载方式不同于2d，需要做区分
         * @returns 返回需要预加载的资源数量
         */
        RES.loadGroup = function (groupName, progress, is3d) {
            var self = RES;
            if (self.$isInit) {
                var config = self.$config;
                var names = config.groups[groupName];
                if (names) {
                    var loader_1 = Laya.loader;
                    var create_1 = lie.Utils.createHandler;
                    var resources = config.resources;
                    var length_2 = names.length;
                    var success_1 = 0, error_1 = 0, current_1 = 0, i = 0;
                    var call0_1 = progress && progress.onProgress;
                    var call1_1 = progress && progress.onComplete;
                    var onProgress_1 = function () {
                        call0_1 && call0_1.call(progress, current_1, length_2);
                        current_1 == length_2 && onComplete_1();
                    };
                    var onComplete_1 = function () {
                        call1_1 && call1_1.call(progress, error_1);
                    };
                    var void0_1 = void 0, getC_1 = self.get3DClass;
                    var loadFun = function (item) {
                        var url = item.url;
                        var type = item.type;
                        var comp = create_1(function (bool) {
                            var res = loader_1.getRes(url);
                            if (res) {
                                success_1++;
                            }
                            else {
                                error_1++;
                            }
                            current_1++;
                            onProgress_1();
                        });
                        if (is3d) {
                            // 待完善
                            loader_1.create(url, comp, void0_1, getC_1(type), void0_1, void0_1, void0_1, item.group);
                        }
                        else {
                            loader_1.load(url, comp, void0_1, item.type, void0_1, void0_1, item.group);
                        }
                    };
                    while (i < length_2) {
                        var name_3 = names[i++];
                        loadFun(resources[name_3]);
                    }
                    return length_2;
                }
            }
            return 0;
        };
        /**
         * 获取资源的信息
         * @param name 别称
         */
        RES.getInfo = function (name) {
            var info = RES.$config.resources[name];
            return RES.$config.resources[name];
        };
        /**
         * 获取资源别称的路径，不存在则返回name
         * @param name 别称s
         */
        RES.getUrl = function (name) {
            return RES.urlCache[name] || name;
        };
        /**
         * 通过资源的别名获取加载后的资源
         * @param name 资源的别名
         */
        RES.getRes = function (name) {
            return Laya.loader.getRes(RES.getUrl(name));
        };
        /**
         * 异步加载资，适用于有配置的资源，没配置的请使用getResByUrl更合适
         * @param name 资源的别名（loadConfig之后），或者相对工程的路径（Laya的默认资源路径）
         * @param is3D 是否采用3D加载该资源
         */
        RES.getAsyncRes = function (name, is3D) {
            var info = RES.getInfo(name);
            var url = info ? info.url : RES.getUrl(name);
            var type = info && info.type;
            is3D && (type = RES.get3DClass(type));
            return RES.getResByUrl(url, type, is3D);
        };
        /**
         * 通过路径加载资源，该方法与RES自身缓存无关，只是简写laya的加载，由于已加载过的资源无法修改类型，如果类型不符合，可先清除资源缓存
         * @param url 路径
         * @param type 资源类型，如果是类对象时为3D，字符串时则会另行分类
         * @param is3D 类型不填写时，可强制指定为3D加载，例如同一纹理就有Texture2D和3D之分
         */
        RES.getResByUrl = function (url, type, is3D) {
            return new Promise(function (resolve) {
                if (type && lie.TypeUtils.isString(type)) {
                    var nType = RES.get3DClass(type);
                    nType && (type = nType, is3D = true);
                }
                // 3D没有返回参数
                var call = function () {
                    resolve(Laya.loader.getRes(url));
                };
                var attr = is3D ? 'create' : 'load';
                Laya.loader[attr](url, lie.Utils.createHandler(call), void 0, type);
            });
        };
        /**
         * 待定，发布时删除
         */
        RES.urlCache = {};
        return RES;
    }());
    lie.RES = RES;
})(lie || (lie = {}));
//# sourceMappingURL=RES.js.map