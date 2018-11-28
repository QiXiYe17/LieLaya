module lie {

	/**
	 * 时间工具类
	 * @author Yin
	 */
	export class TimeUtils {

		protected constructor() {

		}

		private static cache: any = {};

		/**
		 * 计时开始
		 * @param key 标志
		 */
		public static begin(key: string): void {
			TimeUtils.cache[key] = Date.now();
		}

		/**
		 * 计时结束
		 * @param key 标志
		 */
		public static end(key: string): void {
			var cache = TimeUtils.cache;
			var time = cache[key];
			if (time) {
				delete cache[key];
				console.log(key + ' used time:' + (Date.now() - time));
			}
		}

		/**
		 * 数字保持两位数
		 */
		public static formatTen(num: number): string {
			return (num > 9 ? '' : '0') + num;
		}

		/**
		 * 小时-分-秒
		 */
		public static formatHour(second: number, sufix: string = ':'): string {
			var ten = TimeUtils.formatTen;
			var hour = second / 3600 | 0;
			var min = (second / 60 | 0) % 60;
			var sec = second % 60;
			return ten(hour) + sufix + ten(min) + sufix + ten(sec);
		}

        /**
         * 获取天数
         * @param second
         */
		public static getDay(second: number): number {
			return (second + 8 * 3600) / 86400 | 0;
		}

        /**
         * 检测两个秒数是否同一天
         */
		public static isSameDay(second0: number, second1: number): boolean {
			var get = TimeUtils.getDay;
			return get(second0) == get(second1);
		}
	}

	var outCode = 0, valCode = 0, timeout = {}, interval = {};

    /**
     * 模仿setTimeout
     * @param call 
     * @param thisObj 
     * @param delay 
     */
	export const setTimeout = function (call: Function, thisObj?: any, delay?: number, ...param): number {
		var curc = ++outCode;
		var func = timeout[curc] = function () {
			call.apply(thisObj, param);
			delete timeout[curc];
		};
		Laya.timer.once(delay, null, func);
		return curc;
	}

	/**
	 * 清除延迟回调
	 * @param key 标志
	 */
	export const clearTimeout = function (key: number) {
		clear(timeout, key);
	};

	/**
	 * 设置间隔回调
	 * @param call 回调函数
	 * @param thisObj 回调所属对象
	 * @param delay 回调间隔
	 */
	export const setInterval = function (call: Function, thisObj?: any, delay?: number, ...param): number {
		var curc = ++valCode;
		var func = interval[curc] = function () {
			call.apply(thisObj, param);
		};
		Laya.timer.loop(delay, null, func);
		return curc;
	}

	/**
	 * 清除间隔回调
	 * @param key 
	 */
	export const clearInterval = function (key: number) {
		clear(interval, key);
	};

	/**
	 * 清除
	 * @param data 缓存数据
	 * @param key 标志
	 */
	var clear = function (data: any, key: number) {
		var info = data[key];
		if (info) {
			delete data[key];
			Laya.timer.clear(null, info);
		}
	};
}