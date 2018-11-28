module lie {

	/**
	 * 资源配置文件格式
	 */
	interface IResData {
		groups: IGroup[];
		resources: IResItem[];
	}

	/**
	 * 单个资源组的格式
	 */
	interface IGroup {
		keys: string;	// 组的资源别名字符串，用','隔开
		name: string;	// 组名
	}

	/**
	 * 单个资源的格式
	 */
	interface IResItem {
		url: string;	// 相对于assets的路径
		name: string;	// 别名，可通过该名称获取加载后的资源
		type: string;	// 文件类型，具体看Laya.Loader的静态属性
		group?: string;	// 所属的组名
	}

	/**
	 * 资源配置
	 */
	interface IResConfig {
		groups: { [key: string]: string[] };	// 资源组
		resources: { [key: string]: IResItem };	// 资源
	}

	/**
	 * 合图子图属性
	 */
	interface IFrame {
		frame: { x: number, y: number, w: number, h: number };
		sourceSize: any;
		spriteSourceSize: any;
	}

	/**
	 * 加载进度获取的对象
	 */
	export interface IProgress {
		/**
		 * 单项加载完成的回调
		 */
		onProgress: (current: number, total: number) => void;
		/**
		 * 加载完成回调
		 */
		onComplete?: (error: number) => void;
	}

	/**
	 * atlas文件内容
	 */
	export interface IAtlas {
		frames: { [key: string]: IFrame };		// key值图片名
		meta: { image: string, prefix: string };// png图和获取子图片的前缀
	}

	/**
	 * 初始化
	 */
	var isInit, init = function () {
		if (!isInit) {
			isInit = true;
			// 初始化获取资源
			var Loader = <any>Laya.Loader;
			var urlCache = RES.urlCache;
			var cacheRes = Loader.cacheRes, atlas = Laya.Loader.ATLAS/*, need = RES.needPrefix*/;
			// 设置缓存：url，起始坐标，名称前缀
			var setCache = function (url: string, start: number) {
				var end = url.lastIndexOf('.');
				var name = url.substring(start, end) + '_' + url.substr(end + 1);
				urlCache[name] = url;
			};
			var baseUrl = Laya.URL.basePath;
			Loader.cacheRes = function (url: string, data: any) {
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
	export class RES {

		/**
		 * 是否加载了配置
		 */
		private static $isInit: boolean;
		private static $config: IResConfig;

		/**
		 * 待定，发布时删除
		 */
		public static urlCache: any = {};

		/**
		 * 根据资源类型获取3D对应的类，待完善
		 * @param type 资源类型
		 */
		private static get3DClass(type: string): any {
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
		}

		/**
		 * 加载资源配置文件，如不加载，后续方法无法执行
		 * @param resUrl 资源配置文件路径
		 */
		public static loadConfig(resUrl: string): Promise<boolean> {
			var self = RES;
			var loader = Laya.loader;
			init();
			return new Promise<boolean>(function (resolve) {
				loader.load(resUrl, Utils.createHandler<boolean>(function (bool) {
					if (self.$isInit = bool) {
						let urlCache = RES.urlCache;
						let resData = <IResData>loader.getRes(resUrl);
						let groups = resData.groups;
						let resources = resData.resources;
						let config = self.$config = <IResConfig>{};
						let cGroups = config.groups = {};
						let cResources = config.resources = {};
						// 复制资源
						for (let i in resources) {
							let resource = resources[i];
							let name = resource.name;
							cResources[name] = resource;
							urlCache[name] = resource.url;
						}
						// 复制组
						for (let i in groups) {
							let group = groups[i];
							let gName = group.name;
							let array = cGroups[gName] = group.keys.split(',');
							let length = array.length;
							for (let i = 0; i < length; i++) {
								let item = cResources[array[i]];
								if (item)
									item.group = gName;
								// 错误的组内资源
								else {
									array.splice(i, 1);
									i--;
									length--;
								}
							}
						}
					}
					resolve(bool);
				}));
			});
		}

		/**
		 * 添加资源配置
		 * @param name 别称
		 * @param url 路径
		 * @param group 组名
		 */
		public static addConfig(resItem: IResItem): void {
			var config = RES.$config;
			if (config) {
				let name = resItem.name;
				let gName = resItem.group;
				// 创建或者放入已存在的组
				if (gName) {
					let groups = config.groups;
					(groups[gName] || (groups[gName] = [])).push(name);
				}
				config.resources[name] = resItem;
			}
		}

		/**
		 * 加载资源组
		 * @param groupName 组名
		 * @param progress 进度获取对象
		 * @param is3d 是否是存放3D资源的组，3d的加载方式不同于2d，需要做区分
		 * @returns 返回需要预加载的资源数量
		 */
		public static loadGroup(groupName: string, progress?: IProgress, is3d?: boolean): number {
			var self = RES;
			if (self.$isInit) {
				let config = self.$config;
				let names = config.groups[groupName];
				if (names) {
					let loader = Laya.loader;
					let create = Utils.createHandler;
					let resources = config.resources;
					let length = names.length;
					let success = 0, error = 0, current = 0, i = 0;
					let call0 = progress && progress.onProgress;
					let call1 = progress && progress.onComplete;
					let onProgress = function () {
						call0 && call0.call(progress, current, length);
						current == length && onComplete();
					};
					let onComplete = function () {
						call1 && call1.call(progress, error);
					};
					let void0 = void 0, getC = self.get3DClass;
					let loadFun = function (item: IResItem) {
						let url = item.url;
						let type = item.type;
						let comp = create<boolean>(
							function (bool) {
								let res = loader.getRes(url);
								if (res) {
									success++;
								}
								else {
									error++;
								}
								current++;
								onProgress();
							}
						)
						if (is3d) {
							// 待完善
							loader.create(url, comp, void0, getC(type), void0, void0, void0, item.group);
						}
						else {
							loader.load(url, comp, void0, item.type, void0, void0, item.group);
						}
					};
					while (i < length) {
						let name = names[i++];
						loadFun(resources[name])
					}
					return length;
				}
			}
			return 0;
		}

		/**
		 * 获取资源的信息
		 * @param name 别称
		 */
		public static getInfo(name: string): IResItem {
			var info = RES.$config.resources[name];
			return RES.$config.resources[name];
		}

		/**
		 * 获取资源别称的路径，不存在则返回name
		 * @param name 别称s
		 */
		public static getUrl(name: string): string {
			return RES.urlCache[name] || name;
		}

		/**
		 * 通过资源的别名获取加载后的资源
		 * @param name 资源的别名
		 */
		public static getRes(name: string): any {
			return Laya.loader.getRes(RES.getUrl(name));
		}

		/**
		 * 异步加载资，适用于有配置的资源，没配置的请使用getResByUrl更合适
		 * @param name 资源的别名（loadConfig之后），或者相对工程的路径（Laya的默认资源路径）
		 * @param is3D 是否采用3D加载该资源
		 */
		public static getAsyncRes(name: string, is3D?: boolean): Promise<any> {
			var info = RES.getInfo(name);
			var url = info ? info.url : RES.getUrl(name);
			var type = info && info.type;
			is3D && (type = RES.get3DClass(type));
			return RES.getResByUrl(url, type, is3D);
		}

		/**
		 * 通过路径加载资源，该方法与RES自身缓存无关，只是简写laya的加载，由于已加载过的资源无法修改类型，如果类型不符合，可先清除资源缓存
		 * @param url 路径
		 * @param type 资源类型，如果是类对象时为3D，字符串时则会另行分类
		 * @param is3D 类型不填写时，可强制指定为3D加载，例如同一纹理就有Texture2D和3D之分
		 */
		public static getResByUrl(url: string, type?: any, is3D?: boolean): Promise<any> {
			return new Promise<any>(function (resolve) {
				if (type && TypeUtils.isString(type)) {
					let nType = RES.get3DClass(type);
					nType && (type = nType, is3D = true);
				}
				// 3D没有返回参数
				let call = function () {
					resolve(Laya.loader.getRes(url));
				};
				let attr = is3D ? 'create' : 'load';
				Laya.loader[attr](url, Utils.createHandler(call), void 0, type);
			});
		}
	}
}