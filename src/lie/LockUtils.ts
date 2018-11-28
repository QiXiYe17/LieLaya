module lie {

	var key = 0;
	var cache: { [key: number]: Lock } = {};

	class Lock {

		// 执行代码
		private $time: number;
		private $call: Function;
		private $thisObj: any;
		private $params: any[];
		private $isLock: boolean;

		public constructor(time: number, call: Function, thisObj?: any, params?: any[]) {
			this.$time = time;
			this.$call = call;
			this.$thisObj = thisObj;
			this.$params = params;
		}

		/**
		 * 锁住
		 */
		public lock(): void {
			var self = this;
			var timer = Laya.timer;
			self.$isLock = true;
			// timer.clear(self, self.unlock); // 会被覆盖
			timer.once(self.$time, self, self.unlock);
		}

		/**
		 * 解锁
		 */
		public unlock(): void {
			var self = this;
			self.$isLock = false;
			Laya.timer.clear(self, self.unlock);
		}

		/**
		 * 执行
		 */
		public excute(): void {
			var self = this;
			if (!self.$isLock) {
				self.$call.apply(self.$thisObj, self.$params);
			}
		}

		/**
		 * 清除
		 */
		public clear(): void {
			var self = this;
			self.$call = self.$thisObj = self.$params = null;
		}
	}

	/**
	 * 锁工具类，用于锁住时效性的代码
	 */
	export class LockUtils {

		/**
		 * 创建时间锁
		 * @param time 时间长度，锁住之后经过time自动解锁
		 * @param call 解锁状态可执行的代码块
		 * @param thisObj 代码块所属对象
		 * @param params 代码块参数
		 * @returns 返回锁的唯一标识，用于下面代码
		 */
		public static create(time: number, call: Function, thisObj?: any, ...params: any[]): number {
			if (time > 0 && TypeUtils.isFunction(call)) {
				cache[++key] = new Lock(time, call, thisObj, params);
				return key;
			}
			return 0;
		}

		/**
		 * 锁住
		 */
		public static lock(key: number): void {
			var lock = cache[key];
			lock && lock.lock();
		}

		/**
		 * 解锁
		 */
		public static unlock(key: number): void {
			var lock = cache[key];
			lock && lock.unlock();
		}

		/**
		 * 执行代码块，解锁状态才会执行
		 */
		public static excute(key: number): void {
			var lock = cache[key];
			lock && lock.excute();
		}

		/**
		 * 清除
		 */
		public static clear(key: number): void {
			var lock = cache[key];
			if (lock) {
				lock.clear();
				delete cache[key];
			}
		}
	}
}