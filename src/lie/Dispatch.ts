module lie {
	/**
	 * 事件分发工具类，异步操作用
	 */
	export class Dispatch {

		private static $targets: any = {};	// 存放所有回调函数
		private static $laters: any = {};	// 存放延迟数据

		/**
		 * 注册对象
		 * @param key 事件的唯一标志
		 * @param obj 注册事件
		 * @param replace 是否替换掉之前的回调
		 */
		private static $register(key: string, obj: [Function, any], replace?: boolean): boolean {
			var self = Dispatch;
			var target = self.$targets[key];
			var isReg = !target || replace;
			isReg && (self.$targets[key] = obj);
			self.$removeLater(key);
			return isReg;
		}

		/**
		 * 移除延迟
		 */
		private static $removeLater(key: string): void {
			var self = Dispatch;
			var params = self.$laters[key];
			if (params !== void 0) {
				delete self.$laters[key];
				self.$notice(key, params);
			}
		}

		/**
		 * 被动触发回调
		 */
		private static $notice(key: string, params: any[]): void {
			var self = Dispatch;
			params.unshift(key);
			self.notice.apply(self, params);
		}

		/**
		 * 注册事件
		 * @param key 事件的唯一标志
		 * @param call 回调函数
		 * @param thisObj 回调所属对象
		 * @param replace 是否替换掉之前的回调
		 */
		public static register(key: string, call: Function, thisObj?: any, replace?: boolean): boolean {
			return Dispatch.$register(key, [call, thisObj], replace);
		}

		/**
		 * 通知，触发回调
		 * @param key 事件标志
		 * @param param 回调参数
		 */
		public static notice(key: string, ...params: any[]): void {
			var target = Dispatch.$targets[key];
			target && target[0].apply(target[1], params);
		}

		/**
		 * 移除事件
		 */
		public static remove(key: string): void {
			delete Dispatch.$targets[key];
		}

		/**
		 * 是否注册了某个事件
		 */
		public static hasRegister(key: string): boolean {
			return !!Dispatch.$targets[key];
		}

		/**
		 * 注册多个事件，统一回调，参数功能看register
		 */
		public static registers(keys: string[], call: Function, thisObj?: any, replace?: boolean): void {
			var obj = <any>[call, thisObj];
			for (let i in keys) {
				let key = keys[i];
				Dispatch.$register(key, obj, replace);
			}
		}

		/**
		 * 清除所有事件
		 */
		public static clear(): void {
			var self = Dispatch;
			self.$targets = {};
			self.$laters = {};
		}

		/**
		 * 延迟通知，如果已经注册的事件功能同notice，如果未注册，则会等到
		 * 事件注册时立马触发回调
		 * @param key 事件标志
		 * @param param 回调参数
		 */
		public static noticeLater(key: string, ...params: any[]): void {
			var self = Dispatch;
			if (self.hasRegister(key))
				self.$notice(key, params);
			else
				self.$laters[key] = params;
		}
	}
}