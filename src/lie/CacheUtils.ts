module lie {

	/**
	 * 缓存工具类
	 */
	export class CacheUtils<T> {

		private obj: Object;
		private key: string;		// 属性名
		private caches: T[];		// 属性值
		// 通用创建
		private $createFunc: (any) => T;	// 创建缓存对象的方法
		private $createThis: any;			// 方法所属对

		protected constructor(obj: Object, key?: string) {
			this.obj = obj;
			this.key = key || 'm_pCache';
			this.caches = obj[key] = [];
		}

		/**
		 * 初始化创建缓存方法
		 */
		public initCreate(func: () => T, thisObj?: any): void {
			this.$createFunc = func;
			this.$createThis = thisObj;
		}

		/**
		 * 如果缓存不足，则通过创建获取缓存
		 */
		public getByCreate(): T {
			var self = this;
			var cache = self.getCache();
			if (!cache)
				cache = self.$createFunc.call(self.$createThis);
			return cache;
		}

		/**
		 * 单个的添加缓存
		 */
		public addCache(cache: T): void {
			this.caches.push(cache);
		}

		/**
		 * 将datas全存入缓存
		 */
		public pushCache(datas: T[]): void {
			var caches = this.caches;
			for (let i in datas)
				caches.push(datas[i]);
		}

		/**
		 * 根据key值获取缓存，注该key值来源于pushCache或addCache
		 */
		public getCache(): T {
			return this.caches.shift();
		}

		/**
		 * 移除缓存
		 */
		public removeCache(index: number): void {
			this.caches.splice(index, 1);
		}

		// /**
		//  * 更新UI缓存
		//  */
		// private $updateUICache(start: number = 0, visible?: boolean): void {
		// 	var caches = this.caches;
		// 	for (let i = start, len = caches.length; i < len; i++)
		// 		(<any>caches[i]).visible = visible;
		// }

		// /**
		//  * 隐藏UI缓存
		//  * @param start 默认0，从哪里开始隐藏
		//  * 注：如果放入缓存的是控件，才可调用该方法
		//  */
		// public hideUICache(start?: number): void {
		// 	this.$updateUICache(start, false);
		// }
		// /**
		//  * 显示UI缓存
		//  * @param start 默认0，从哪里开始显示
		//  * 注：如果放入缓存的是控件，才可调用该方法
		//  */
		// public showUICache(start?: number): void {
		// 	this.$updateUICache(start, true);
		// }

		/**
		 * 一经调用，则该缓存就没用了
		 */
		public clearCache(): void {
			var self = this;
			delete self.obj[self.key];
			self.obj = self.key = self.caches = null;
		}

		/**
		 * 创建缓存
		 * @param obj 创建缓存工具的对象
		 * @param key 创建缓存工具的属性名，不能跟obj原有属性冲突
		 */
		public static createCache<T>(obj: Object, key?: string): CacheUtils<T> {
			return new CacheUtils<T>(obj, key);
		}
	}
}