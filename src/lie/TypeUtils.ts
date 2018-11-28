module lie {
	/**
	 * 类型检验工具类
	 */
	export class TypeUtils {

		/**
		 * 检测是否是字符串类型，注意new String检测不通过的
		 */
		public static isString(obj: any): boolean {
			return typeof obj === 'string' && obj.constructor === String;
		}

		/**
		 * 检测是不是数组
		 */
		public static isArray(obj: any): boolean {
			return obj instanceof Array && Object.prototype.toString.call(obj) === '[object Array]';
		}

		/**
		 * 检测是不是数字，注意new Number不算进来
		 */
		public static isNumber(obj: any): boolean {
			return typeof obj === 'number' && !isNaN(obj);	// type NaN === 'number' 所以要去掉
		}

		/**
		 * 是不是对象，数组也是一种对象
		 */
		public static isObject(obj: any): boolean {
			return typeof obj === 'object';
		}

		/**
		 * 是不是函数
		 */
		public static isFunction(obj: any): boolean {
			return typeof obj === 'function';
		}

		/**
		 * 检测类型是否相等
		 */
		public static isSame(obj0: any, obj1: any): boolean {
			var bool = true;
			if (obj0 != obj1) {
				bool = obj0.__proto__ == obj1.__proto__;
			}
			return bool;
		}
	}
}