module lie {

	/**
	 * 数组操作工具类
	 * 目标：1.简化一些数组相关的操作；
	 * 2.（重点）由于数组的部分方法本身会形成新切片，而不修改自身原始的数据，
	 * 因此保留原有的功能的同时自身也会发生变化
	 */
	export class ArrayUtils {

		/**
		 * 将source的内容全部插入target
		 * @param target 目标
		 * @param source 来源
		 * @param inHead 是否插在头部
		 */
		public static insert<T>(target: T[], source: T[], inHead?: boolean): void {
			target[inHead ? 'unshift' : 'push'].apply(target, source);
		}

		/**
		 * 将target的内容替换成source，类似于target = source.concat()，
		 * 但是target所指向的原始地址没改变，注意target不能等同于source，不然会被清空
		 * @param target 被替换目标，内容改变，内存地址不变
		 * @param source 替换的内容
		 */
		public static replace<T>(target: T[], source: T[]): void {
			target.length = 0;
			ArrayUtils.insert(target, source);
		}

		/**
		 * 等长分割字符串，保证前面等长，即最后一段的长度小于等于length
		 */
		public static splitString(str: string, length: number): string[] {
			if (length == 1)
				return str.split('');
			var array = [];
			var sLength = str.length;
			for (let i = 0; i < sLength; i += length) {
				array.push(str.substr(i, length));
			}
			return array;
		}

		/**
		 * 等长分割字符串，保证后面等长，即第一段的长度小于等于length
		 */
		public static splitRString(str: string, length: number): string[] {
			var array = [];
			var start = str.length;
			do {
				array.unshift(str.substring(start - length, start));
				start -= length;
			} while (start > 0);
			return array;
		}
	}
}